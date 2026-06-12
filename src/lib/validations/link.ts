import { z } from "zod";

const customCodeRegex = /^[a-zA-Z0-9_-]+$/;

const customCodeField = z
  .string()
  .min(3,  "Custom code must be at least 3 characters")
  .max(50, "Custom code must be under 50 characters")
  .regex(customCodeRegex, "Only letters, numbers, hyphens and underscores allowed")
  .optional();

export const createLinkSchema = z.object({
  originalUrl: z.string().url("Please enter a valid URL"),
  title:       z.string().max(255).optional(),
  customCode:  customCodeField,
  password:    z
    .string()
    .min(4, "Password must be at least 4 characters")
    .max(72, "Password must be under 72 characters") // bcrypt max
    .optional(),
  expiresAt:   z.string().datetime().optional(),
});

export const updateLinkSchema = z.object({
  title:       z.string().max(255).optional(),
  active:      z.boolean().optional(),
  customCode:  customCodeField,
  password:    z
    .string()
    .min(4, "Password must be at least 4 characters")
    .max(72, "Password must be under 72 characters")
    .optional(),
  removePassword: z.boolean().optional(), // explicitly remove password protection
  expiresAt:   z.string().datetime().nullable().optional(),
});

export type CreateLinkInput = z.infer<typeof createLinkSchema>;
export type UpdateLinkInput = z.infer<typeof updateLinkSchema>;