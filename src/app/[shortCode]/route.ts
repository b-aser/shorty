import { NextRequest, NextResponse } from "next/server";
import { getLinkByShortCode, incrementClickCount } from "@/lib/services/links";
import { trackClick } from "@/lib/services/clicks";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ shortCode: string }> }
) {
  const { shortCode } = await params;

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
  const ip        = getIpFromRequest(request);
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

function getIpFromRequest(request: NextRequest): string | null {
  // Vercel / proxies set this header
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0].trim() ??
    request.headers.get("x-real-ip") ??
    null
  );
}