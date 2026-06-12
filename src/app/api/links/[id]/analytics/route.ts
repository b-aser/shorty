import { NextRequest, NextResponse } from "next/server";
import { requireSession } from "@/lib/session";
import { getLinkAnalytics } from "@/lib/services/analytics";

export async function GET(
  _: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await requireSession();
    const data    = await getLinkAnalytics(params.id, session.user.id);
    if (!data) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}