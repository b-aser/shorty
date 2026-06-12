import { NextRequest, NextResponse } from "next/server";
import { requireSession } from "@/lib/session";
import { getLinkAnalytics } from "@/lib/services/analytics";
import { getLinkById } from "@/lib/services/links";
import { buildUrlWithUtm } from "@/lib/utm";

export async function GET(
  _: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id }  = await params;
    const session = await requireSession();
    const data    = await getLinkAnalytics(id, session.user.id);
    if (!data) return NextResponse.json({ error: "Not found" }, { status: 404 });

    // Build the preview URL so the frontend can show what the final URL looks like
    const previewUrl = buildUrlWithUtm(data.link.originalUrl, {
      utmSource:   data.link.utmSource,
      utmMedium:   data.link.utmMedium,
      utmCampaign: data.link.utmCampaign,
      utmTerm:     data.link.utmTerm,
      utmContent:  data.link.utmContent,
    });

    return NextResponse.json({ ...data, previewUrl });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}