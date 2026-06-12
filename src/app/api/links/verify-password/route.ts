import { NextRequest, NextResponse } from "next/server";
import { getLinkByShortCode } from "@/lib/services/links";
import { verifyPassword } from "@/lib/password";
import { SignJWT } from "jose";
import { checkRateLimit } from "@/lib/ratelimit";

// npm install jose
const SECRET = new TextEncoder().encode(process.env.BETTER_AUTH_SECRET!);

export async function POST(req: NextRequest) {
  const { shortCode, password } = await req.json();

  if (!shortCode || !password) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const link = await getLinkByShortCode(shortCode);

  if (!link || !link.isProtected || !link.passwordHash) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const valid = await verifyPassword(password, link.passwordHash);

  if (!valid) {
    return NextResponse.json({ error: "Incorrect password" }, { status: 401 });
  }

  const allowed = checkRateLimit(
    `pw:${shortCode}`,
    5,           // max 5 attempts
    15 * 60 * 1000  // per 15 minutes
  );
  
  if (!allowed) {
    return NextResponse.json(
      { error: "Too many attempts. Please try again in 15 minutes." },
      { status: 429 }
    );
  } 
  // Issue a short-lived JWT stored in a cookie
  // Valid for 1 hour — after that they'll need to re-enter the password
  const token = await new SignJWT({ linkId: link.id })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("1h")
    .sign(SECRET);

  const response = NextResponse.json({ success: true });

  response.cookies.set(`pw_${link.id}`, token, {
    httpOnly: true,
    secure:   process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge:   60 * 60, // 1 hour
    path:     "/",
  });

  return response;
}