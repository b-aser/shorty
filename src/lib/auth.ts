import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@/db";
import * as schema from "@/db/schema";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "mysql",
    schema: {
      user:         schema.users,
      session:      schema.sessions,
      account:      schema.accounts,
      verification: schema.verifications,
    },
  }),

  emailAndPassword: {
    enabled: true,
  },

  // Optional but recommended: add Google OAuth later with just this block
  // socialProviders: {
  //   google: {
  //     clientId:     process.env.GOOGLE_CLIENT_ID!,
  //     clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
  //   },
  // },

  session: {
    expiresIn:        60 * 60 * 24 * 7,  // 7 days
    updateAge:        60 * 60 * 24,       // refresh if older than 1 day
    cookieCache: {
      enabled:   true,
      maxAge:    60 * 5,                  // cache session cookie for 5 min
    },
  },

  trustedOrigins: [process.env.BETTER_AUTH_URL!],
});

export type Session = typeof auth.$Infer.Session;
export type User    = typeof auth.$Infer.Session.user;