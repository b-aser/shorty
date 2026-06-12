import { db } from "@/db";
import { clickEvents, links } from "@/db/schema";
import { eq, and, gte, sql } from "drizzle-orm";

export async function getLinkAnalytics(linkId: string, userId: string) {
  // Verify ownership
  const link = await db.query.links.findFirst({
    where: and(eq(links.id, linkId), eq(links.userId, userId)),
  });
  if (!link) return null;

  // All click events for this link
  const events = await db.query.clickEvents.findMany({
    where: eq(clickEvents.linkId, linkId),
    orderBy: (ce, { asc }) => asc(ce.createdAt),
  });

  // Clicks per day (last 30 days)
  const clicksPerDay = await db
    .select({
      date:  sql<string>`DATE(${clickEvents.createdAt})`,
      count: sql<number>`COUNT(*)`,
    })
    .from(clickEvents)
    .where(
      and(
        eq(clickEvents.linkId, linkId),
        gte(clickEvents.createdAt, new Date(Date.now() - 30 * 24 * 60 * 60 * 1000))
      )
    )
    .groupBy(sql`DATE(${clickEvents.createdAt})`);

  // Top countries
  const byCountry = await db
    .select({
      country: clickEvents.country,
      count:   sql<number>`COUNT(*)`,
    })
    .from(clickEvents)
    .where(eq(clickEvents.linkId, linkId))
    .groupBy(clickEvents.country)
    .orderBy(sql`COUNT(*) DESC`)
    .limit(5);

  // By device
  const byDevice = await db
    .select({
      device: clickEvents.device,
      count:  sql<number>`COUNT(*)`,
    })
    .from(clickEvents)
    .where(eq(clickEvents.linkId, linkId))
    .groupBy(clickEvents.device);

  // By browser
  const byBrowser = await db
    .select({
      browser: clickEvents.browser,
      count:   sql<number>`COUNT(*)`,
    })
    .from(clickEvents)
    .where(eq(clickEvents.linkId, linkId))
    .groupBy(clickEvents.browser)
    .orderBy(sql`COUNT(*) DESC`)
    .limit(5);

  return {
    link,
    totalClicks: events.length,
    clicksPerDay,
    byCountry,
    byDevice,
    byBrowser,
  };
}