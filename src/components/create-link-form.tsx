"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CustomCodeInput } from "@/components/custom-code-input";
import { toast } from "sonner";
import { ChevronDown, ChevronUp } from "lucide-react";
import { PasswordInput } from "./password-input";
import { UtmBuilder, type UtmValues } from "@/components/utm-builder";
import { formatApiError } from "@/lib/utils";

export function CreateLinkForm({ appUrl }: { appUrl: string }) {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  // Add password to form state
  const [form, setForm] = useState({
    originalUrl: "",
    title: "",
    customCode: "",
    password: "", // add this
  });
  // Add UTM to form state
  const [utmValues, setUtmValues] = useState<UtmValues>({
    utmSource: "",
    utmMedium: "",
    utmCampaign: "",
    utmTerm: "",
    utmContent: "",
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    // Add to the body construction in handleSubmit
    const body: Record<string, string> = { originalUrl: form.originalUrl };
    if (form.title) body.title = form.title;
    if (form.customCode) body.customCode = form.customCode;
    if (form.password) body.password = form.password; // add this
    // Add UTM to body construction in handleSubmit
    if (utmValues.utmSource) body.utmSource = utmValues.utmSource;
    if (utmValues.utmMedium) body.utmMedium = utmValues.utmMedium;
    if (utmValues.utmCampaign) body.utmCampaign = utmValues.utmCampaign;
    if (utmValues.utmTerm) body.utmTerm = utmValues.utmTerm;
    if (utmValues.utmContent) body.utmContent = utmValues.utmContent;

    const res = await fetch("/api/links", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (res.ok) {
      const link = await res.json();
      setUtmValues({
        utmSource: "",
        utmMedium: "",
        utmCampaign: "",
        utmTerm: "",
        utmContent: "",
      });
      toast.success("Link created!", {
        description: `${appUrl}/${link.shortCode}`,
      });
      setForm({ originalUrl: "", title: "", customCode: "", password: "" });
      setShowAdvanced(false);
      router.refresh();
    } else {
      const { error } = await res.json();
      toast.error("Error", {
        description: formatApiError(error),
      });
    }

    setLoading(false);
  }

  // Add to the body construction in handleSubmit
  const body: Record<string, string> = { originalUrl: form.originalUrl };
  if (form.title) body.title = form.title;
  if (form.customCode) body.customCode = form.customCode;
  if (form.password) body.password = form.password; // add this

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Shorten a URL</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Main row */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1">
              <Label htmlFor="originalUrl" className="sr-only">
                URL
              </Label>
              <Input
                id="originalUrl"
                type="url"
                placeholder="https://your-long-url.com/goes/here"
                value={form.originalUrl}
                onChange={(e) =>
                  setForm({ ...form, originalUrl: e.target.value })
                }
                required
              />
            </div>
            <Button type="submit" disabled={loading} className="shrink-0">
              {loading ? "Shortening..." : "Shorten"}
            </Button>
          </div>

          {/* Advanced toggle */}
          <button
            type="button"
            onClick={() => setShowAdvanced((v) => !v)}
            className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors"
          >
            {showAdvanced ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
            {showAdvanced ? "Hide options" : "Custom code & title"}
          </button>

          {/* Advanced fields */}
          {showAdvanced && (
            <div className="space-y-4 pt-1">
              <div className="space-y-2">
                <Label htmlFor="title">
                  Title{" "}
                  <span className="text-muted-foreground font-normal">
                    (optional)
                  </span>
                </Label>
                <Input
                  id="title"
                  placeholder="e.g. My GitHub profile"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                />
              </div>

              <CustomCodeInput
                value={form.customCode}
                onChange={(val) => setForm({ ...form, customCode: val })}
                appUrl={appUrl}
              />
              <PasswordInput
                value={form.password}
                onChange={(val) => setForm({ ...form, password: val })}
              />
              <UtmBuilder
                values={utmValues}
                onChange={setUtmValues}
                originalUrl={form.originalUrl}
              />
            </div>
          )}
        </form>
      </CardContent>
    </Card>
  );
}
