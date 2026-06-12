export interface MysqlCredentials {
  host: string;
  port: number;
  user: string;
  password: string;
  database: string;
}

/** Parse mysql:// URLs without relying on `new URL()` (breaks on ? & # in passwords). */
export function parseMysqlUrl(url: string): MysqlCredentials {
  const prefix = "mysql://";
  if (!url.startsWith(prefix)) {
    throw new Error("DATABASE_URL must start with mysql://");
  }

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

  return {
    host,
    port: portStr ? Number(portStr) : 3306,
    user,
    password,
    database,
  };
}

export function getMysqlCredentials(): MysqlCredentials {
  const url = process.env.DATABASE_URL ?? process.env.DATABASE_HOST;
  if (!url) throw new Error("Missing DATABASE_URL");
  return parseMysqlUrl(url);
}
