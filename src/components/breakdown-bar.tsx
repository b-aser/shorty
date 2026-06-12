import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface BreakdownBarProps {
  title: string;
  data:  { label: string | null; count: number }[];
}

export function BreakdownBar({ title, data }: BreakdownBarProps) {
  const total = data.reduce((s, d) => s + Number(d.count), 0);
  if (total === 0) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {data.map((item) => {
          const pct   = Math.round((Number(item.count) / total) * 100);
          const label = item.label ?? "Unknown";
          return (
            <div key={label}>
              <div className="flex justify-between text-sm mb-1">
                <span className="font-medium">{label}</span>
                <span className="text-muted-foreground">{item.count} ({pct}%)</span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
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