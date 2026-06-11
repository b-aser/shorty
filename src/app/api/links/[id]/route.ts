import { NextRequest, NextResponse } from "next/server";
import { requireSession } from "@/lib/session";
import { updateLinkSchema } from "@/lib/validations/link";
import { getLinkById, updateLink, deleteLink } from "@/lib/services/links";

// GET /api/links/:id
export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id }  = await params;
    const session = await requireSession();
    const link    = await getLinkById(id, session.user.id);
    if (!link) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(link);
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}

// PATCH /api/links/:id
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id }  = await params;
    const session = await requireSession();
    const body    = await req.json();
    const parsed  = updateLinkSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const link = await updateLink(id, session.user.id, parsed.data);
    if (!link) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(link);
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}

// DELETE /api/links/:id
export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id }  = await params;
    const session = await requireSession();
    const link    = await getLinkById(id, session.user.id);
    if (!link) return NextResponse.json({ error: "Not found" }, { status: 404 });

    await deleteLink(id, session.user.id);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}