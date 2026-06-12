import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient();

// Named exports for convenience
export const {
  signIn,
  signOut,
  signUp,
  useSession,
} = authClient;