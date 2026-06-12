"use client";

import { useState, useEffect, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";

interface CustomCodeInputProps {
  value:       string;
  onChange:    (val: string) => void;
  excludeId?:  string;   // pass when editing an existing link
  appUrl:      string;
}

type Status = "idle" | "checking" | "available" | "taken";

export function CustomCodeInput({
  value, onChange, excludeId, appUrl,
}: CustomCodeInputProps) {
  const [status, setStatus] = useState<Status>("idle");

  const check = useCallback(async (code: string) => {
    if (!code || code.length < 3) { setStatus("idle"); return; }
    setStatus("checking");

    const params = new URLSearchParams({ code });
    if (excludeId) params.set("excludeId", excludeId);

    const res  = await fetch(`/api/links/check-code?${params}`);
    const data = await res.json();
    setStatus(data.available ? "available" : "taken");
  }, [excludeId]);

  // Debounce — only check 500ms after user stops typing
  useEffect(() => {
    const timer = setTimeout(() => check(value), 500);
    return () => clearTimeout(timer);
  }, [value, check]);

  const icon = {
    idle:      null,
    checking:  <Loader2    className="w-4 h-4 animate-spin text-muted-foreground" />,
    available: <CheckCircle2 className="w-4 h-4 text-green-500" />,
    taken:     <XCircle    className="w-4 h-4 text-destructive" />,
  }[status];

  const hint = {
    idle:      "Letters, numbers, hyphens and underscores only.",
    checking:  "Checking availability...",
    available: `✓ "${value}" is available!`,
    taken:     `✗ "${value}" is already taken or reserved.`,
  }[status];

  const hintColor = {
    idle:      "text-muted-foreground",
    checking:  "text-muted-foreground",
    available: "text-green-600",
    taken:     "text-destructive",
  }[status];

  return (
    <div className="space-y-2">
      <Label htmlFor="customCode">
        Custom code <span className="text-muted-foreground font-normal">(optional)</span>
      </Label>
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground shrink-0">
          {appUrl}/
        </span>
        <div className="relative flex-1">
          <Input
            id="customCode"
            placeholder="my-brand"
            value={value}
            onChange={(e) => onChange(e.target.value.replace(/\s/g, "-"))}
            className={
              status === "taken"
                ? "border-destructive focus-visible:ring-destructive pr-9"
                : status === "available"
                ? "border-green-500 focus-visible:ring-green-500 pr-9"
                : "pr-9"
            }
          />
          {icon && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              {icon}
            </div>
          )}
        </div>
      </div>
      <p className={`text-xs ${hintColor}`}>{hint}</p>
    </div>
  );
}