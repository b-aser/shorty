import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import * as schema from "./schema";
import { getMysqlCredentials } from "./credentials";

const pool = mysql.createPool(getMysqlCredentials());

export const db = drizzle(pool, { schema, mode: "default" });
