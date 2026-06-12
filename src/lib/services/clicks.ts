import { db } from "@/db";
import { clickEvents } from "@/db/schema";
import { v4 as uuidv4 } from "uuid";
import { UAParser } from "ua-parser-js";
import { getGeoFromIp } from "@/lib/geo";

interface TrackClickOptions {
  linkId:    string;
  userAgent: string | null;
  referer:   string | null;
  ip:        string | null;
}

export async function trackClick({ linkId, userAgent, referer, ip }: TrackClickOptions) {
  const ua      = new UAParser(userAgent ?? "");
  const browser = ua.getBrowser().name ?? null;
  const os      = ua.getOS().name ?? null;
  const device  = getDeviceType(ua.getDevice().type);

  // Geo lookup from local MaxMind GeoLite2 database
  const { country, city } = await getGeoFromIp(ip);

  await db.insert(clickEvents).values({
    id: uuidv4(),
    linkId,
    browser,
    os,
    device,
    referer,
    country,
    city,
  });
}

function getDeviceType(type: string | undefined): string {
  if (type === "mobile")  return "mobile";
  if (type === "tablet")  return "tablet";
  return "desktop";
}