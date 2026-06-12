import { drizzle } from "drizzle-orm/mysql2";
import mysql, { type Pool } from "mysql2/promise";
import * as schema from "./schema";
import { getMysqlCredentials } from "./credentials";

const globalForDb = globalThis as unknown as { mysqlPool: Pool | undefined };

const pool =
  globalForDb.mysqlPool ??
  mysql.createPool({
    ...getMysqlCredentials(),
    connectionLimit: 5,
    waitForConnections: true,
    queueLimit: 0,
    enableKeepAlive: true,
    keepAliveInitialDelay: 0,
  });

if (process.env.NODE_ENV !== "production") {
  globalForDb.mysqlPool = pool;
}

export const db = drizzle(pool, { schema, mode: "default" });
