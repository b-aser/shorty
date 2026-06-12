import { z } from "zod";

// Allowed characters for custom codes: letters, numbers, hyphens, underscores
const customCodeRegex = /^[a-zA-Z0-9_-]+$/;

export const createLinkSchema = z.object({
  originalUrl: z.string().url("Please enter a valid URL"),
  title:       z.string().max(255).optional(),
  customCode:  z
    .string()
    .min(3,  "Custom code must be at least 3 characters")
    .max(50, "Custom code must be under 50 characters")
    .regex(customCodeRegex, "Only letters, numbers, hyphens and underscores allowed")
    .optional(),
  expiresAt:   z.string().datetime().optional(),
});

export const updateLinkSchema = z.object({
  title:      z.string().max(255).optional(),
  active:     z.boolean().optional(),
  customCode: z
    .string()
    .min(3,  "Custom code must be at least 3 characters")
    .max(50, "Custom code must be under 50 characters")
    .regex(customCodeRegex, "Only letters, numbers, hyphens and underscores allowed")
    .optional(),
  expiresAt:  z.string().datetime().nullable().optional(),
});

export type CreateLinkInput = z.infer<typeof createLinkSchema>;
export type UpdateLinkInput = z.infer<typeof updateLinkSchema>;