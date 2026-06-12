import { NextRequest, NextResponse } from "next/server";
import { getLinkByShortCode, incrementClickCount } from "@/lib/services/links";
import { trackClick } from "@/lib/services/clicks";
import { getIpFromRequest } from "@/lib/ip";
import { checkRedirectRateLimit } from "@/lib/ratelimit";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ shortCode: string }> }
) {
  const { shortCode } = await params;
  const ip = getIpFromRequest(request);

  const rateLimit = await checkRedirectRateLimit(ip ?? "anonymous");
  if (!rateLimit.success) {
    const retryAfter = Math.max(1, Math.ceil((rateLimit.reset - Date.now()) / 1000));
    return new NextResponse("Too many requests. Please try again later.", {
      status: 429,
      headers: { "Retry-After": String(retryAfter) },
    });
  }

  // 1. Look up the link
  const link = await getLinkByShortCode(shortCode);

  // 2. Not found
  if (!link) {
    return NextResponse.redirect(new URL("/not-found", request.url));
  }

  // 3. Disabled
  if (!link.active) {
    return NextResponse.redirect(new URL("/link-disabled", request.url));
  }

  // 4. Expired
  if (link.expiresAt && new Date() > link.expiresAt) {
    return NextResponse.redirect(new URL("/link-expired", request.url));
  }

  // 5. Track click + increment counter (non-blocking — don't await)
  const userAgent = request.headers.get("user-agent");
  const referer   = request.headers.get("referer");

  void Promise.all([
    trackClick({ linkId: link.id, userAgent, referer, ip }),
    incrementClickCount(link.id),
  ]);

  // 6. Redirect
  return NextResponse.redirect(link.originalUrl, {
    status: 307, // Temporary redirect — preserves HTTP method
  });
}
