import mysql from "mysql2/promise";
import { config } from "dotenv";

config({ path: ".env" });
config({ path: ".env.local", override: true });

function parseMysqlUrl(url) {
  const prefix = "mysql://";
  if (!url.startsWith(prefix)) throw new Error("DATABASE_URL must start with mysql://");
  const rest = url.slice(prefix.length);
  const atIndex = rest.lastIndexOf("@");
  if (atIndex === -1) throw new Error("Invalid DATABASE_URL");
  const userPass = rest.slice(0, atIndex);
  const hostAndDb = rest.slice(atIndex + 1);
  const slashIndex = hostAndDb.indexOf("/");
  if (slashIndex === -1) throw new Error("Invalid DATABASE_URL");
  const hostPort = hostAndDb.slice(0, slashIndex);
  const database = hostAndDb.slice(slashIndex + 1);
  const colonIndex = userPass.indexOf(":");
  if (colonIndex === -1) throw new Error("Invalid DATABASE_URL");
  const user = decodeURIComponent(userPass.slice(0, colonIndex));
  const password = decodeURIComponent(userPass.slice(colonIndex + 1));
  const [host, portStr] = hostPort.split(":");
  if (!host || !database) throw new Error("Invalid DATABASE_URL");
  return { host, port: portStr ? Number(portStr) : 3306, user, password, database };
}

const creds = parseMysqlUrl(process.env.DATABASE_URL ?? process.env.DATABASE_HOST);

async function columnExists(conn, table, column) {
  const [rows] = await conn.query(
    `SELECT 1 FROM information_schema.COLUMNS
     WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ? AND COLUMN_NAME = ?`,
    [creds.database, table, column]
  );
  return rows.length > 0;
}

async function indexExists(conn, table, indexName) {
  const [rows] = await conn.query(
    `SELECT 1 FROM information_schema.STATISTICS
     WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ? AND INDEX_NAME = ?`,
    [creds.database, table, indexName]
  );
  return rows.length > 0;
}

const conn = await mysql.createConnection(creds);

try {
  const [cols] = await conn.query(
    `SELECT COLUMN_NAME, COLUMN_TYPE, IS_NULLABLE
     FROM information_schema.COLUMNS
     WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'links'
     ORDER BY ORDINAL_POSITION`,
    [creds.database]
  );
  console.log("Current links columns:", cols);

  const [countRows] = await conn.query("SELECT COUNT(*) AS n FROM links");
  console.log("links row count:", countRows[0].n);

  // 1. Widen short_code (safe, no data loss)
  await conn.query(
    "ALTER TABLE links MODIFY COLUMN short_code VARCHAR(50) NOT NULL"
  );
  console.log("✓ short_code widened to VARCHAR(50)");

  // 2. Add normalized_code as nullable first
  if (!(await columnExists(conn, "links", "normalized_code"))) {
    await conn.query(
      "ALTER TABLE links ADD COLUMN normalized_code VARCHAR(50) NULL"
    );
    console.log("✓ normalized_code added (nullable)");
  } else {
    console.log("· normalized_code already exists");
  }

  // 3. Add is_custom_code with default
  if (!(await columnExists(conn, "links", "is_custom_code"))) {
    await conn.query(
      "ALTER TABLE links ADD COLUMN is_custom_code BOOLEAN NOT NULL DEFAULT FALSE"
    );
    console.log("✓ is_custom_code added");
  } else {
    console.log("· is_custom_code already exists");
  }

  // 4. Backfill normalized_code from short_code
  const [updateResult] = await conn.query(
    "UPDATE links SET normalized_code = LOWER(short_code) WHERE normalized_code IS NULL"
  );
  console.log(`✓ backfilled normalized_code (${updateResult.affectedRows} rows)`);

  // 5. Make normalized_code NOT NULL
  await conn.query(
    "ALTER TABLE links MODIFY COLUMN normalized_code VARCHAR(50) NOT NULL"
  );
  console.log("✓ normalized_code set to NOT NULL");

  // 6. Unique constraint + index (match drizzle schema)
  if (!(await indexExists(conn, "links", "links_normalized_code_unique"))) {
    await conn.query(
      "ALTER TABLE links ADD CONSTRAINT links_normalized_code_unique UNIQUE (normalized_code)"
    );
    console.log("✓ unique constraint on normalized_code");
  } else {
    console.log("· links_normalized_code_unique already exists");
  }

  if (!(await indexExists(conn, "links", "normalized_code_idx"))) {
    await conn.query(
      "CREATE INDEX normalized_code_idx ON links (normalized_code)"
    );
    console.log("✓ normalized_code_idx created");
  } else {
    console.log("· normalized_code_idx already exists");
  }

  console.log("\nMigration complete. Run: pnpm db:push");
} finally {
  await conn.end();
}
