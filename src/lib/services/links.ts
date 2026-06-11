import { db } from "@/db";
import { links, clickEvents } from "@/db/schema";
import { eq, desc, and, sql } from "drizzle-orm";
import { nanoid } from "nanoid";
import { v4 as uuidv4 } from "uuid";
import type { CreateLinkInput, UpdateLinkInput } from "@/lib/validations/link";

// install uuid: npm install uuid @types/uuid
export async function createLink(userId: string, input: CreateLinkInput) {
  const id        = uuidv4();
  const shortCode = nanoid(6); // e.g. "aB3xYz"

  await db.insert(links).values({
    id,
    userId,
    originalUrl: input.originalUrl,
    shortCode,
    title:       input.title ?? null,
    expiresAt:   input.expiresAt ? new Date(input.expiresAt) : null,
  });

  return db.query.links.findFirst({
    where: eq(links.id, id),
  });
}

export async function getLinksByUser(userId: string) {
  return db.query.links.findMany({
    where:   eq(links.userId, userId),
    orderBy: desc(links.createdAt),
  });
}

export async function getLinkById(id: string, userId: string) {
  return db.query.links.findFirst({
    where: and(eq(links.id, id), eq(links.userId, userId)),
  });
}

export async function updateLink(id: string, userId: string, input: UpdateLinkInput) {
  await db.update(links)
    .set({
      ...input,
      expiresAt: input.expiresAt ? new Date(input.expiresAt) : null,
      updatedAt: new Date(),
    })
    .where(and(eq(links.id, id), eq(links.userId, userId)));

  return getLinkById(id, userId);
}

export async function deleteLink(id: string, userId: string) {
  await db.delete(links)
    .where(and(eq(links.id, id), eq(links.userId, userId)));
}

export async function getLinkByShortCode(shortCode: string) {
  return db.query.links.findFirst({
    where: eq(links.shortCode, shortCode),
  });
}

export async function incrementClickCount(linkId: string) {
  await db.update(links)
    .set({ clicks: sql`${links.clicks} + 1` })
    .where(eq(links.id, linkId));
}

export async function getClicksByLink(linkId: string, userId: string) {
  // Verify ownership first
  const link = await getLinkById(linkId, userId);
  if (!link) return null;

  return db.query.clickEvents.findMany({
    where:   eq(clickEvents.linkId, linkId),
    orderBy: desc(clickEvents.createdAt),
    limit:   100,
  });
}