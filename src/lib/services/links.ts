import { db } from "@/db";
import { links, clickEvents } from "@/db/schema";
import { eq, desc, and, sql } from "drizzle-orm";
import { nanoid } from "nanoid";
import { v4 as uuidv4 } from "uuid";
import { isReservedCode } from "@/lib/reserved-codes";
import type { CreateLinkInput, UpdateLinkInput } from "@/lib/validations/link";
import { hashPassword } from "../password";
import { buildUrlWithUtm } from "@/lib/utm";

// ---- Helpers ----

export async function isCodeAvailable(
  code: string,
  excludeId?: string,
): Promise<boolean> {
  const normalized = code.toLowerCase();

  if (isReservedCode(normalized)) return false;

  const existing = await db.query.links.findFirst({
    where: eq(links.normalizedCode, normalized),
  });

  if (!existing) return true;
  if (excludeId && existing.id === excludeId) return true; // same link — allow
  return false;
}

function generateShortCode(): string {
  return nanoid(6);
}

async function getUniqueAutoCode(): Promise<string> {
  // Keep generating until we find one that's not taken
  let code = generateShortCode();
  let attempts = 0;

  while (!(await isCodeAvailable(code)) && attempts < 10) {
    code = generateShortCode();
    attempts++;
  }

  return code;
}

// ---- CRUD ----

// Update createLink — replace the db.insert values block:
export async function createLink(userId: string, input: CreateLinkInput) {
  let shortCode: string;
  let isCustomCode: boolean;

  if (input.customCode) {
    const available = await isCodeAvailable(input.customCode);
    if (!available) {
      throw new Error(
        `The code "${input.customCode}" is already taken or reserved.`,
      );
    }
    shortCode = input.customCode;
    isCustomCode = true;
  } else {
    shortCode = await getUniqueAutoCode();
    isCustomCode = false;
  }

  let passwordHash: string | null = null;
  let isProtected = false;

  if (input.password) {
    passwordHash = await hashPassword(input.password);
    isProtected = true;
  }

  const id = uuidv4();

  await db.insert(links).values({
    id,
    userId,
    originalUrl: input.originalUrl,
    shortCode,
    normalizedCode: shortCode.toLowerCase(),
    isCustomCode,
    title: input.title ?? null,
    expiresAt: input.expiresAt ? new Date(input.expiresAt) : null,
    passwordHash,
    isProtected,

    // UTM params
    utmSource: input.utmSource ?? null,
    utmMedium: input.utmMedium ?? null,
    utmCampaign: input.utmCampaign ?? null,
    utmTerm: input.utmTerm ?? null,
    utmContent: input.utmContent ?? null,
  });

  return db.query.links.findFirst({
    where: eq(links.id, id),
  });
}

// Update updateLink — replace the db.update set block:
export async function updateLink(
  id: string,
  userId: string,
  input: UpdateLinkInput,
) {
  const existing = await getLinkById(id, userId);
  if (!existing) return null;

  let shortCode = existing.shortCode;
  let normalizedCode = existing.normalizedCode;
  let isCustomCode = existing.isCustomCode;

  if (
    input.customCode &&
    input.customCode.toLowerCase() !== existing.normalizedCode
  ) {
    const available = await isCodeAvailable(input.customCode, id);
    if (!available) {
      throw new Error(
        `The code "${input.customCode}" is already taken or reserved.`,
      );
    }
    shortCode = input.customCode;
    normalizedCode = input.customCode.toLowerCase();
    isCustomCode = true;
  }

  let passwordHash = existing.passwordHash;
  let isProtected = existing.isProtected;

  if (input.removePassword) {
    passwordHash = null;
    isProtected = false;
  } else if (input.password) {
    passwordHash = await hashPassword(input.password);
    isProtected = true;
  }

  // Clear all UTM params if requested, otherwise merge with existing
  const utmUpdate = input.clearUtm
    ? {
        utmSource: null,
        utmMedium: null,
        utmCampaign: null,
        utmTerm: null,
        utmContent: null,
      }
    : {
        utmSource:
          input.utmSource !== undefined
            ? input.utmSource || null
            : existing.utmSource,
        utmMedium:
          input.utmMedium !== undefined
            ? input.utmMedium || null
            : existing.utmMedium,
        utmCampaign:
          input.utmCampaign !== undefined
            ? input.utmCampaign || null
            : existing.utmCampaign,
        utmTerm:
          input.utmTerm !== undefined
            ? input.utmTerm || null
            : existing.utmTerm,
        utmContent:
          input.utmContent !== undefined
            ? input.utmContent || null
            : existing.utmContent,
      };

  await db
    .update(links)
    .set({
      title: input.title ?? existing.title,
      active: input.active ?? existing.active,
      expiresAt:
        input.expiresAt !== undefined
          ? input.expiresAt
            ? new Date(input.expiresAt)
            : null
          : existing.expiresAt,
      shortCode,
      normalizedCode,
      isCustomCode,
      passwordHash,
      isProtected,
      ...utmUpdate,
      updatedAt: new Date(),
    })
    .where(and(eq(links.id, id), eq(links.userId, userId)));

  return getLinkById(id, userId);
}

export async function getLinksByUser(userId: string) {
  return db.query.links.findMany({
    where: eq(links.userId, userId),
    orderBy: desc(links.createdAt),
  });
}

export async function getLinkById(id: string, userId: string) {
  return db.query.links.findFirst({
    where: and(eq(links.id, id), eq(links.userId, userId)),
  });
}

export async function deleteLink(id: string, userId: string) {
  await db.delete(links).where(and(eq(links.id, id), eq(links.userId, userId)));
}

// Use normalizedCode for lookups so case doesn't matter
export async function getLinkByShortCode(shortCode: string) {
  return db.query.links.findFirst({
    where: eq(links.normalizedCode, shortCode.toLowerCase()),
  });
}

export async function incrementClickCount(linkId: string) {
  await db
    .update(links)
    .set({ clicks: sql`${links.clicks} + 1` })
    .where(eq(links.id, linkId));
}

export async function getClicksByLink(linkId: string, userId: string) {
  const link = await getLinkById(linkId, userId);
  if (!link) return null;

  return db.query.clickEvents.findMany({
    where: eq(clickEvents.linkId, linkId),
    orderBy: (ce, { asc }) => asc(ce.createdAt),
    limit: 100,
  });
}
