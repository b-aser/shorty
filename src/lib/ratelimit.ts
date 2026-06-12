import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

let redirectLimiter: Ratelimit | null | undefined;

function getRedirectLimiter(): Ratelimit | null {
  if (redirectLimiter !== undefined) return redirectLimiter;

  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) {
    redirectLimiter = null;
    return null;
  }

  redirectLimiter = new Ratelimit({
    redis: Redis.fromEnv(),
    limiter: Ratelimit.slidingWindow(10, "1 m"),
    prefix: "shorty:redirect",
  });

  return redirectLimiter;
}

export async function checkRedirectRateLimit(
  ip: string
): Promise<{ success: true } | { success: false; reset: number }> {
  const limiter = getRedirectLimiter();
  if (!limiter) return { success: true };

  const result = await limiter.limit(ip);
  if (result.success) return { success: true };
  return { success: false, reset: result.reset };
}
