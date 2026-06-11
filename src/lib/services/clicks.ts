import { db } from "@/db";
import { clickEvents } from "@/db/schema";
import { v4 as uuidv4 } from "uuid";
import { UAParser } from "ua-parser-js";

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

  // Geo lookup from IP (free, no API key needed)
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

async function getGeoFromIp(ip: string | null): Promise<{ country: string | null; city: string | null }> {
  if (!ip || ip === "127.0.0.1" || ip === "::1") {
    return { country: null, city: null }; // localhost — skip lookup
  }

  try {
    const res  = await fetch(`http://ip-api.com/json/${ip}?fields=country,city`, {
      next: { revalidate: 3600 }, // cache same IP for 1hr
    });
    const data = await res.json();
    return {
      country: data.country ?? null,
      city:    data.city    ?? null,
    };
  } catch {
    return { country: null, city: null };
  }
}