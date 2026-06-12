import { config } from "dotenv";
import type { Config } from "drizzle-kit";
import { getMysqlCredentials } from "./src/db/credentials";

config({ path: ".env" });
config({ path: ".env.local", override: true });

export default {
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dialect: "mysql",
  dbCredentials: getMysqlCredentials(),
} satisfies Config;
