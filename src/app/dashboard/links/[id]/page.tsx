import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/session";
import { getLinkAnalytics } from "@/lib/services/analytics";
import { StatCard } from "@/components/stat-card";
import { ClicksChart } from "@/components/clicks-chart";
import { BreakdownBar } from "@/components/breakdown-bar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, MousePointerClick, Calendar, Link2 } from "lucide-react";
import { QrCodeDialog } from "@/components/qr-code-dialog";

import { UtmSummaryCard } from "@/components/utm-summary-card";
import { UtmBreakdown } from "@/components/utm-breakdown";
import { buildUrlWithUtm } from "@/lib/utm";

export default async function LinkAnalyticsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/sign-in");

  const { id } = await params;
  const data = await getLinkAnalytics(id, session.user.id);
  if (!data) notFound();

  const {
    link,
    totalClicks,
    clicksPerDay,
    byCountry,
    byDevice,
    byBrowser,
    utmData,
  } = data;

  const appUrl = process.env.NEXT_PUBLIC_APP_URL!;
  const shortUrl = `${appUrl}/${link.shortCode}`;
  const created = new Date(link.createdAt).toLocaleDateString("en", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const previewUrl = buildUrlWithUtm(link.originalUrl, {
    utmSource: link.utmSource,
    utmMedium: link.utmMedium,
    utmCampaign: link.utmCampaign,
    utmTerm: link.utmTerm,
    utmContent: link.utmContent,
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard">
            <ArrowLeft className="w-4 h-4" />
          </Link>
        </Button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-2xl font-bold truncate">
              {link.title ?? link.shortCode}
            </h1>
            <Badge variant={link.active ? "default" : "secondary"}>
              {link.active ? "Active" : "Disabled"}
            </Badge>
            <QrCodeDialog
              shortUrl={shortUrl}
              title={link.title ?? link.shortCode}
            />
          </div>
          <a
            href={shortUrl}
            target="_blank"
            className="text-sm text-primary hover:underline"
          >
            {shortUrl}
          </a>
        </div>
      </div>

      <Separator />

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title="Total Clicks"
          value={totalClicks}
          icon={<MousePointerClick className="w-4 h-4" />}
        />
        <StatCard
          title="Short URL"
          value={link.shortCode}
          subtitle={shortUrl}
          icon={<Link2 className="w-4 h-4" />}
        />
        <StatCard
          title="Created"
          value={created}
          icon={<Calendar className="w-4 h-4" />}
        />
        <UtmSummaryCard link={link} previewUrl={previewUrl} />
      </div>

      {/* Chart */}
      <ClicksChart
        data={clicksPerDay.map((d) => ({
          date: d.date,
          count: Number(d.count),
        }))}
      />

      {/* Breakdowns */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <BreakdownBar
          title="Top Countries"
          data={byCountry.map((d) => ({
            label: d.country,
            count: Number(d.count),
          }))}
        />
        <BreakdownBar
          title="Devices"
          data={byDevice.map((d) => ({
            label: d.device,
            count: Number(d.count),
          }))}
        />
        <BreakdownBar
          title="Browsers"
          data={byBrowser.map((d) => ({
            label: d.browser,
            count: Number(d.count),
          }))}
        />
        
      </div>
      <Separator />
      <UtmBreakdown data={utmData} />
    </div>
  );
}
