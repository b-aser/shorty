import { NextRequest, NextResponse } from "next/server";
import { requireSession } from "@/lib/session";
import { createLinkSchema } from "@/lib/validations/link";
import { createLink, getLinksByUser } from "@/lib/services/links";

// GET /api/links — list all links for current user
export async function GET() {
   try {
    const session = await requireSession();
    const data    = await getLinksByUser(session.user.id);
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}

// POST /api/links — create a new link
export async function POST(req: NextRequest) {
  try {
    const session = await requireSession();
    const body    = await req.json();
    const parsed  = createLinkSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const link = await createLink(session.user.id, parsed.data);
    return NextResponse.json(link, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}