"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, ArrowRight } from "lucide-react";

export function PasswordForm({ shortCode }: { shortCode: string }) {
  const [password, setPassword]   = useState("");
  const [showPw, setShowPw]       = useState(false);
  const [error, setError]         = useState("");
  const [loading, setLoading]     = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/links/verify-password", {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ shortCode, password }),
    });

    if (res.ok) {
      // Cookie is now set — redirect back to the short link
      // The redirect engine will see the valid cookie and let them through
      window.location.href = `/${shortCode}`;
    } else {
      const data = await res.json();
      setError(data.error ?? "Incorrect password. Please try again.");
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <div className="relative">
          <Input
            id="password"
            type={showPw ? "text" : "password"}
            placeholder="Enter password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={`pr-10 ${error ? "border-destructive focus-visible:ring-destructive" : ""}`}
            required
            autoFocus
          />
          <button
            type="button"
            onClick={() => setShowPw((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            tabIndex={-1}
          >
            {showPw
              ? <EyeOff className="w-4 h-4" />
              : <Eye    className="w-4 h-4" />
            }
          </button>
        </div>

        {error && (
          <p className="text-sm text-destructive">{error}</p>
        )}
      </div>

      <Button type="submit" className="w-full gap-2" disabled={loading}>
        {loading ? "Verifying..." : (
          <>Continue <ArrowRight className="w-4 h-4" /></>
        )}
      </Button>
    </form>
  );
}