// These short codes are reserved and cannot be used as vanity URLs
export const RESERVED_CODES = new Set([
    "dashboard",
    "sign-in",
    "sign-up",
    "api",
    "not-found",
    "link-disabled",
    "link-expired",
    "link-password",  // we'll use this in Feature B
    "admin",
    "settings",
    "help",
    "about",
    "pricing",
  ]);
  
  export function isReservedCode(code: string): boolean {
    return RESERVED_CODES.has(code.toLowerCase());
  }