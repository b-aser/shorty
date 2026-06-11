"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

export function CreateLinkForm() {
  const router   = useRouter();
  const [form, setForm]       = useState({ originalUrl: "", title: "" });
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const res = await fetch("/api/links", {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify(form),
    });

    if (res.ok) {
      toast.success("Link created!", { description: "Your short link is ready." });
      setForm({ originalUrl: "", title: "" });
      router.refresh();
    } else {
      const err = await res.json();
      toast.error(err.error ?? "Something went wrong", {
        description: err.error ?? "Something went wrong",
      });
    }

    setLoading(false);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Shorten a URL</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 space-y-1">
            <Label htmlFor="originalUrl" className="sr-only">URL</Label>
            <Input
              id="originalUrl"
              type="url"
              placeholder="https://your-long-url.com/goes/here"
              value={form.originalUrl}
              onChange={(e) => setForm({ ...form, originalUrl: e.target.value })}
              required
            />
          </div>
          <div className="w-full sm:w-48 space-y-1">
            <Label htmlFor="title" className="sr-only">Title (optional)</Label>
            <Input
              id="title"
              placeholder="Title (optional)"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />
          </div>
          <Button type="submit" disabled={loading} className="shrink-0">
            {loading ? "Shortening..." : "Shorten"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}