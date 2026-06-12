"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog, DialogContent, DialogHeader,
  DialogTitle, DialogTrigger, DialogFooter,
} from "@/components/ui/dialog";
import { CustomCodeInput } from "@/components/custom-code-input";
import { toast } from "sonner";
import { Pencil } from "lucide-react";

interface EditLinkDialogProps {
  link: {
    id:        string;
    title:     string | null;
    shortCode: string;
  };
  appUrl: string;
}

export function EditLinkDialog({ link, appUrl }: EditLinkDialogProps) {
  const router    = useRouter();
  const [open, setOpen]       = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm]       = useState({
    title:      link.title      ?? "",
    customCode: link.shortCode  ?? "",
  });

  async function handleSave() {
    setLoading(true);

    const res = await fetch(`/api/links/${link.id}`, {
      method:  "PATCH",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({
        title:      form.title      || null,
        customCode: form.customCode || undefined,
      }),
    });

    if (res.ok) {
      toast.success("Link updated!");
      setOpen(false);
      router.refresh();
    } else {
      const { error } = await res.json();
      toast.error("Error", {
        description: error ?? "Something went wrong",
      });
    }

    setLoading(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-2">
          <Pencil className="w-4 h-4" /> Edit
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit link</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="edit-title">Title</Label>
            <Input
              id="edit-title"
              placeholder="e.g. My GitHub profile"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />
          </div>

          <CustomCodeInput
            value={form.customCode}
            onChange={(val) => setForm({ ...form, customCode: val })}
            excludeId={link.id}
            appUrl={appUrl}
          />
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={handleSave} disabled={loading}>
            {loading ? "Saving..." : "Save changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}