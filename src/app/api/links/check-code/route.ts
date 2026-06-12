import { NextRequest, NextResponse } from "next/server";
import { requireSession } from "@/lib/session";
import { isCodeAvailable } from "@/lib/services/links";

export async function GET(req: NextRequest) {
  try {
    await requireSession();

    const code = req.nextUrl.searchParams.get("code");
    if (!code) {
      return NextResponse.json({ error: "code is required" }, { status: 400 });
    }

    if (code.length < 3) {
      return NextResponse.json({ available: false, reason: "Too short" });
    }

    const excludeId = req.nextUrl.searchParams.get("excludeId") ?? undefined;
    const available = await isCodeAvailable(code, excludeId);

    return NextResponse.json({ available });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}