import { z } from "zod";

export const createLinkSchema = z.object({
  originalUrl: z.string().url("Please enter a valid URL"),
  title:       z.string().max(255).optional(),
  expiresAt:   z.string().datetime().optional(), // ISO string from client
});

export const updateLinkSchema = z.object({
  title:    z.string().max(255).optional(),
  active:   z.boolean().optional(),
  expiresAt: z.string().datetime().nullable().optional(),
});

export type CreateLinkInput = z.infer<typeof createLinkSchema>;
export type UpdateLinkInput = z.infer<typeof updateLinkSchema>;