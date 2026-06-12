import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart2 } from "lucide-react";

interface UtmBreakdownProps {
  data: {
    byCampaign: { campaign: string | null; clicks: number }[];
    bySource:   { source:   string | null; clicks: number }[];
    byMedium:   { medium:   string | null; clicks: number }[];
  };
}

function BreakdownList({
  title,
  rows,
  labelKey,
}: {
  title:    string;
  rows:     { label: string | null; clicks: number }[];
  labelKey: string;
}) {
  const total = rows.reduce((s, r) => s + Number(r.clicks), 0);
  if (total === 0 || rows.length === 0) return null;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {rows.map((row) => {
          const pct   = Math.round((Number(row.clicks) / total) * 100);
          const label = row.label ?? "Unknown";
          return (
            <div key={label}>
              <div className="flex justify-between text-sm mb-1">
                <span className="font-mono font-medium">{label}</span>
                <span className="text-muted-foreground">
                  {row.clicks} click{Number(row.clicks) !== 1 ? "s" : ""} ({pct}%)
                </span>
              </div>
              <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full transition-all"
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}

export function UtmBreakdown({ data }: UtmBreakdownProps) {
  const hasData =
    data.byCampaign.length > 0 ||
    data.bySource.length   > 0 ||
    data.byMedium.length   > 0;

  if (!hasData) return null;

  return (
    <div className="space-y-3">
      <h2 className="text-base font-semibold flex items-center gap-2">
        <BarChart2 className="w-4 h-4" />
        UTM Performance
        <span className="text-sm font-normal text-muted-foreground">
          — across all your links
        </span>
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <BreakdownList
          title="Top Campaigns"
          rows={data.byCampaign.map((d) => ({ label: d.campaign, clicks: d.clicks }))}
          labelKey="campaign"
        />
        <BreakdownList
          title="Top Sources"
          rows={data.bySource.map((d) => ({ label: d.source, clicks: d.clicks }))}
          labelKey="source"
        />
        <BreakdownList
          title="Top Mediums"
          rows={data.byMedium.map((d) => ({ label: d.medium, clicks: d.clicks }))}
          labelKey="medium"
        />
      </div>
    </div>
  );
}