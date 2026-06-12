import fs from "fs";
import path from "path";
import maxmind, { type CityResponse, type Reader } from "maxmind";

const globalForMaxmind = globalThis as typeof globalThis & {
  maxmindReader?: Reader<CityResponse>;
};

async function getReader(): Promise<Reader<CityResponse> | null> {
  if (globalForMaxmind.maxmindReader) return globalForMaxmind.maxmindReader;

  const dbPath =
    process.env.MAXMIND_DB_PATH ??
    path.join(process.cwd(), "data", "GeoLite2-City.mmdb");

  if (!fs.existsSync(dbPath)) return null;

  const reader = await maxmind.open<CityResponse>(dbPath);
  globalForMaxmind.maxmindReader = reader;
  return reader;
}

export async function getGeoFromIp(
  ip: string | null
): Promise<{ country: string | null; city: string | null }> {
  if (!ip || ip === "127.0.0.1" || ip === "::1") {
    return { country: null, city: null };
  }

  try {
    const reader = await getReader();
    if (!reader) return { country: null, city: null };

    const result = reader.get(ip);
    return {
      country: result?.country?.names?.en ?? null,
      city: result?.city?.names?.en ?? null,
    };
  } catch {
    return { country: null, city: null };
  }
}
