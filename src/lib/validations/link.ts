import { z } from "zod";

const customCodeRegex = /^[a-zA-Z0-9_-]+$/;

const customCodeField = z
  .string()
  .min(3,  "Custom code must be at least 3 characters")
  .max(50, "Custom code must be under 50 characters")
  .regex(customCodeRegex, "Only letters, numbers, hyphens and underscores allowed")
  .optional();

// UTM fields — shared between create and update
const utmFields = {
  utmSource:   z.string().max(255).nullish(),
  utmMedium:   z.string().max(255).nullish(),
  utmCampaign: z.string().max(255).nullish(),
  utmTerm:     z.string().max(255).nullish(),
  utmContent:  z.string().max(255).nullish(),
};

export const createLinkSchema = z.object({
  originalUrl: z.string().url("Please enter a valid URL"),
  title:       z.string().max(255).optional(),
  customCode:  customCodeField,
  password:    z
    .string()
    .min(4, "Password must be at least 4 characters")
    .max(72, "Password must be under 72 characters")
    .optional(),
  expiresAt: z.string().datetime().optional(),
  ...utmFields,
});

export const updateLinkSchema = z.object({
  title:          z.string().max(255).optional(),
  active:         z.boolean().optional(),
  customCode:     customCodeField,
  password:       z
    .string()
    .min(4, "Password must be at least 4 characters")
    .max(72, "Password must be under 72 characters")
    .optional(),
  removePassword: z.boolean().optional(),
  expiresAt:      z.string().datetime().nullable().optional(),
  ...utmFields,

  // Allow explicitly clearing UTM fields on update
  clearUtm:       z.boolean().optional(),
});

export type CreateLinkInput = z.infer<typeof createLinkSchema>;
export type UpdateLinkInput = z.infer<typeof updateLinkSchema>;