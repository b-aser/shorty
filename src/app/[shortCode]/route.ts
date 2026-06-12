import { NextRequest, NextResponse } from "next/server";
import { getLinkByShortCode, incrementClickCount } from "@/lib/services/links";
import { trackClick } from "@/lib/services/clicks";
import { jwtVerify } from "jose";

const SECRET = new TextEncoder().encode(process.env.BETTER_AUTH_SECRET!);

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ shortCode: string }> }
) {
  const { shortCode } = await params;

  const link = await getLinkByShortCode(shortCode);

  // Not found
  if (!link) {
    return NextResponse.redirect(new URL("/not-found", request.url));
  }

  // Disabled
  if (!link.active) {
    return NextResponse.redirect(new URL("/link-disabled", request.url));
  }

  // Expired
  if (link.expiresAt && new Date() > link.expiresAt) {
    return NextResponse.redirect(new URL("/link-expired", request.url));
  }

  // Password protected — check for valid cookie
  if (link.isProtected) {
    const cookie = request.cookies.get(`pw_${link.id}`);
    const verified = await verifyPasswordCookie(cookie?.value, link.id);

    if (!verified) {
      // Send to password prompt page
      return NextResponse.redirect(
        new URL(`/link-password/${link.shortCode}`, request.url)
      );
    }
  }

  // Track click (non-blocking)
  const ip        = getIpFromRequest(request);
  const userAgent = request.headers.get("user-agent");
  const referer   = request.headers.get("referer");

  void Promise.all([
    trackClick({ linkId: link.id, userAgent, referer, ip }),
    incrementClickCount(link.id),
  ]);

  return NextResponse.redirect(link.originalUrl, { status: 307 });
}

async function verifyPasswordCookie(
  token: string | undefined,
  linkId: string
): Promise<boolean> {
  if (!token) return false;
  try {
    const { payload } = await jwtVerify(token, SECRET);
    return payload.linkId === linkId;
  } catch {
    return false;
  }
}

function getIpFromRequest(request: NextRequest): string | null {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0].trim() ??
    request.headers.get("x-real-ip") ??
    null
  );
}