import mysql from "mysql2/promise";
import { config } from "dotenv";

config({ path: ".env" });
config({ path: ".env.local", override: true });

function parseMysqlUrl(url) {
  const prefix = "mysql://";
  if (!url.startsWith(prefix)) throw new Error("DATABASE_URL must start with mysql://");
  const rest = url.slice(prefix.length);
  const atIndex = rest.lastIndexOf("@");
  const userPass = rest.slice(0, atIndex);
  const hostAndDb = rest.slice(atIndex + 1);
  const slashIndex = hostAndDb.indexOf("/");
  const hostPort = hostAndDb.slice(0, slashIndex);
  const database = hostAndDb.slice(slashIndex + 1);
  const colonIndex = userPass.indexOf(":");
  const user = decodeURIComponent(userPass.slice(0, colonIndex));
  const password = decodeURIComponent(userPass.slice(colonIndex + 1));
  const [host, portStr] = hostPort.split(":");
  return { host, port: portStr ? Number(portStr) : 3306, user, password, database };
}

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

const creds = parseMysqlUrl(process.env.DATABASE_URL ?? process.env.DATABASE_HOST);
const conn = await mysql.createConnection(creds);

const timestampTables = [
  { table: "users", cols: ["created_at", "updated_at"] },
  { table: "sessions", cols: ["created_at", "updated_at"] },
  { table: "accounts", cols: ["created_at", "updated_at"] },
  { table: "verifications", cols: ["created_at"] },
  { table: "links", cols: ["created_at", "updated_at"] },
  { table: "click_events", cols: ["created_at"] },
];

try {
  console.log("Syncing timestamp defaults (reduces drizzle-kit drift)...");

  for (const { table, cols } of timestampTables) {
    for (const col of cols) {
      const onUpdate = col === "updated_at" ? " ON UPDATE CURRENT_TIMESTAMP" : "";
      await conn.query(
        `ALTER TABLE \`${table}\` MODIFY COLUMN \`${col}\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP${onUpdate}`
      );
      console.log(`✓ ${table}.${col}`);
    }
  }

  if (!(await columnExists(conn, "links", "normalized_code"))) {
    await conn.query("ALTER TABLE links ADD COLUMN normalized_code VARCHAR(50) NULL");
    console.log("✓ links.normalized_code added (nullable)");
  }

  if (!(await columnExists(conn, "links", "is_custom_code"))) {
    await conn.query(
      "ALTER TABLE links ADD COLUMN is_custom_code BOOLEAN NOT NULL DEFAULT FALSE"
    );
    console.log("✓ links.is_custom_code added");
  }

  const [updateResult] = await conn.query(
    "UPDATE links SET normalized_code = LOWER(short_code) WHERE normalized_code IS NULL"
  );
  if (updateResult.affectedRows > 0) {
    console.log(`✓ backfilled normalized_code (${updateResult.affectedRows} rows)`);
  }

  await conn.query(
    "ALTER TABLE links MODIFY COLUMN normalized_code VARCHAR(50) NOT NULL"
  );
  console.log("✓ links.normalized_code NOT NULL");

  if (!(await indexExists(conn, "links", "links_normalized_code_unique"))) {
    await conn.query(
      "ALTER TABLE links ADD CONSTRAINT links_normalized_code_unique UNIQUE (normalized_code)"
    );
    console.log("✓ links_normalized_code_unique");
  }

  if (!(await indexExists(conn, "links", "normalized_code_idx"))) {
    await conn.query("CREATE INDEX normalized_code_idx ON links (normalized_code)");
    console.log("✓ normalized_code_idx");
  }

  console.log("\nDone. Try: pnpm db:push");
} finally {
  await conn.end();
}
