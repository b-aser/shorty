import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tag } from "lucide-react";

interface UtmSummaryCardProps {
  link: {
    utmSource:   string | null;
    utmMedium:   string | null;
    utmCampaign: string | null;
    utmTerm:     string | null;
    utmContent:  string | null;
  };
  previewUrl: string;
}

const UTM_LABELS: { key: keyof UtmSummaryCardProps["link"]; label: string }[] = [
  { key: "utmSource",   label: "Source"   },
  { key: "utmMedium",   label: "Medium"   },
  { key: "utmCampaign", label: "Campaign" },
  { key: "utmTerm",     label: "Term"     },
  { key: "utmContent",  label: "Content"  },
];

export function UtmSummaryCard({ link, previewUrl }: UtmSummaryCardProps) {
  const activeParams = UTM_LABELS.filter((f) => link[f.key]);
  if (activeParams.length === 0) return null;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Tag className="w-4 h-4" />
          UTM Parameters
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Param badges */}
        <div className="flex flex-wrap gap-2">
          {activeParams.map(({ key, label }) => (
            <div key={key} className="flex items-center gap-1.5">
              <span className="text-xs text-muted-foreground">{label}:</span>
              <Badge variant="secondary" className="text-xs font-mono">
                {link[key]}
              </Badge>
            </div>
          ))}
        </div>

        {/* Final URL preview */}
        <div className="space-y-1.5">
          <p className="text-xs text-muted-foreground font-medium">
            Final destination URL
          </p>
          <p className="text-xs break-all font-mono bg-muted rounded px-3 py-2 text-muted-foreground">
            {previewUrl}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}