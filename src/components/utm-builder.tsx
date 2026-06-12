"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ChevronDown, ChevronUp, Zap, X } from "lucide-react";
import { buildUrlWithUtm, UTM_PRESETS, hasUtmParams } from "@/lib/utm";

export interface UtmValues {
  utmSource:   string;
  utmMedium:   string;
  utmCampaign: string;
  utmTerm:     string;
  utmContent:  string;
}

interface UtmBuilderProps {
  values:      UtmValues;
  onChange:    (values: UtmValues) => void;
  originalUrl: string;  // for live preview
}

const UTM_FIELDS: {
  key:         keyof UtmValues;
  label:       string;
  placeholder: string;
  required:    boolean;
  hint:        string;
}[] = [
  {
    key:         "utmSource",
    label:       "Source",
    placeholder: "e.g. twitter, newsletter, google",
    required:    true,
    hint:        "Where your traffic comes from",
  },
  {
    key:         "utmMedium",
    label:       "Medium",
    placeholder: "e.g. social, email, cpc",
    required:    true,
    hint:        "The marketing channel",
  },
  {
    key:         "utmCampaign",
    label:       "Campaign",
    placeholder: "e.g. summer-sale, product-launch",
    required:    true,
    hint:        "The specific campaign name",
  },
  {
    key:         "utmTerm",
    label:       "Term",
    placeholder: "e.g. running+shoes",
    required:    false,
    hint:        "Paid search keywords (optional)",
  },
  {
    key:         "utmContent",
    label:       "Content",
    placeholder: "e.g. banner-a, text-link",
    required:    false,
    hint:        "A/B test variant (optional)",
  },
];

export function UtmBuilder({ values, onChange, originalUrl }: UtmBuilderProps) {
  const [open, setOpen] = useState(hasUtmParams(values));

  const isActive = hasUtmParams(values);

  function handleField(key: keyof UtmValues, val: string) {
    onChange({ ...values, [key]: val });
  }

  function applyPreset(preset: typeof UTM_PRESETS[number]) {
    onChange({
      ...values,
      utmSource:   preset.values.utmSource,
      utmMedium:   preset.values.utmMedium,
      utmCampaign: values.utmCampaign, // keep existing campaign
      utmTerm:     values.utmTerm,
      utmContent:  values.utmContent,
    });
    setOpen(true);
  }

  function clearAll() {
    onChange({
      utmSource:   "",
      utmMedium:   "",
      utmCampaign: "",
      utmTerm:     "",
      utmContent:  "",
    });
  }

  // Live preview URL
  const previewUrl = originalUrl
    ? buildUrlWithUtm(originalUrl, values)
    : null;

  const previewChanged = previewUrl && previewUrl !== originalUrl;

  return (
    <div className="space-y-3">
      {/* Toggle row */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="flex items-center gap-2 text-sm font-medium hover:text-foreground transition-colors"
        >
          {open
            ? <ChevronUp   className="w-4 h-4" />
            : <ChevronDown className="w-4 h-4" />
          }
          UTM parameters
          {isActive && (
            <Badge variant="secondary" className="text-xs ml-1">Active</Badge>
          )}
        </button>

        {isActive && (
          <button
            type="button"
            onClick={clearAll}
            className="text-xs text-muted-foreground hover:text-destructive flex items-center gap-1 transition-colors"
          >
            <X className="w-3 h-3" /> Clear all
          </button>
        )}
      </div>

      {open && (
        <div className="space-y-4 rounded-lg border bg-muted/30 p-4">

          {/* Presets */}
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground font-medium flex items-center gap-1">
              <Zap className="w-3 h-3" /> Quick presets
            </p>
            <div className="flex flex-wrap gap-2">
              {UTM_PRESETS.map((preset) => (
                <Button
                  key={preset.label}
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-7 text-xs"
                  onClick={() => applyPreset(preset)}
                >
                  {preset.label}
                </Button>
              ))}
            </div>
          </div>

          <Separator />

          {/* Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {UTM_FIELDS.map((field) => (
              <div key={field.key} className="space-y-1.5">
                <Label htmlFor={`utm-${field.key}`} className="text-xs font-medium">
                  {field.label}
                  {field.required
                    ? <span className="text-muted-foreground ml-1">(recommended)</span>
                    : <span className="text-muted-foreground ml-1">(optional)</span>
                  }
                </Label>
                <Input
                  id={`utm-${field.key}`}
                  placeholder={field.placeholder}
                  value={values[field.key]}
                  onChange={(e) =>
                    handleField(field.key, e.target.value.replace(/\s+/g, "-").toLowerCase())
                  }
                  className="h-8 text-sm"
                />
                <p className="text-xs text-muted-foreground">{field.hint}</p>
              </div>
            ))}
          </div>

          {/* Live preview */}
          {previewChanged && (
            <>
              <Separator />
              <div className="space-y-1.5">
                <p className="text-xs font-medium text-muted-foreground">
                  Final destination URL preview
                </p>
                <p className="text-xs break-all font-mono bg-background rounded border px-3 py-2 text-muted-foreground">
                  {previewUrl}
                </p>
              </div>
            </>
          )}

        </div>
      )}
    </div>
  );
}