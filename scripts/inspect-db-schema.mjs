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

const creds = parseMysqlUrl(process.env.DATABASE_URL ?? process.env.DATABASE_HOST);
const conn = await mysql.createConnection(creds);

const tables = ["users", "sessions", "accounts", "verifications", "links", "click_events"];

for (const table of tables) {
  console.log(`\n=== ${table} ===`);
  const [cols] = await conn.query(
    `SELECT COLUMN_NAME, COLUMN_TYPE, IS_NULLABLE, COLUMN_KEY, EXTRA
     FROM information_schema.COLUMNS
     WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ?
     ORDER BY ORDINAL_POSITION`,
    [creds.database, table]
  );
  for (const c of cols) {
    console.log(`  ${c.COLUMN_NAME}: ${c.COLUMN_TYPE} nullable=${c.IS_NULLABLE} key=${c.COLUMN_KEY}`);
  }
  const [indexes] = await conn.query(`SHOW INDEX FROM \`${table}\``);
  const byName = new Map();
  for (const idx of indexes) {
    if (!byName.has(idx.Key_name)) byName.set(idx.Key_name, []);
    byName.get(idx.Key_name).push(idx.Column_name);
  }
  console.log("  indexes:");
  for (const [name, cols2] of byName) {
    console.log(`    ${name}: (${cols2.join(", ")})`);
  }
}

await conn.end();
