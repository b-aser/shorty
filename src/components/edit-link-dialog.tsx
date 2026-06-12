"use client";

import { useState } from "react";

import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";

import { Input } from "@/components/ui/input";

import { Label } from "@/components/ui/label";

import { Badge } from "@/components/ui/badge";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";

import { Separator } from "@/components/ui/separator";

import { CustomCodeInput } from "@/components/custom-code-input";

import { PasswordInput } from "@/components/password-input";

import { toast } from "sonner";

import { Pencil, Lock, ShieldOff } from "lucide-react";

import { UtmBuilder, type UtmValues } from "@/components/utm-builder";
import { formatApiError } from "@/lib/utils";

interface EditLinkDialogProps {
  link: {
    id: string;

    title: string | null;

    originalUrl: string;

    shortCode: string;

    isProtected: boolean;

    utmSource: string | null;

    utmMedium: string | null;

    utmCampaign: string | null;

    utmTerm: string | null;

    utmContent: string | null;
  };

  appUrl: string;
}

export function EditLinkDialog({ link, appUrl }: EditLinkDialogProps) {
  const router = useRouter();

  const [open, setOpen] = useState(false);

  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    title: link.title ?? "",

    customCode: link.shortCode ?? "",

    newPassword: "",

    removePassword: false,
  });

  const [utmValues, setUtmValues] = useState<UtmValues>({
    utmSource: link.utmSource ?? "",

    utmMedium: link.utmMedium ?? "",

    utmCampaign: link.utmCampaign ?? "",

    utmTerm: link.utmTerm ?? "",

    utmContent: link.utmContent ?? "",
  });

  function handleOpen(val: boolean) {
    setOpen(val);

    if (val) {
      setForm({
        title: link.title ?? "",

        customCode: link.shortCode ?? "",

        newPassword: "",

        removePassword: false,
      });

      setUtmValues({
        utmSource: link.utmSource ?? "",

        utmMedium: link.utmMedium ?? "",

        utmCampaign: link.utmCampaign ?? "",

        utmTerm: link.utmTerm ?? "",

        utmContent: link.utmContent ?? "",
      });
    }
  }

  async function handleSave() {
    setLoading(true);

    const hasUtm = Object.values(utmValues).some(Boolean);

    const utmPayload = hasUtm
      ? Object.fromEntries(
          Object.entries({
            utmSource: utmValues.utmSource,
            utmMedium: utmValues.utmMedium,
            utmCampaign: utmValues.utmCampaign,
            utmTerm: utmValues.utmTerm,
            utmContent: utmValues.utmContent,
          }).filter(([, value]) => Boolean(value))
        )
      : { clearUtm: true };

    const body: Record<string, unknown> = {
      title: form.title || null,

      customCode: form.customCode || undefined,

      ...utmPayload,
    };

    if (form.removePassword) {
      body.removePassword = true;
    } else if (form.newPassword) {
      body.password = form.newPassword;
    }

    const res = await fetch(`/api/links/${link.id}`, {
      method: "PATCH",

      headers: { "Content-Type": "application/json" },

      body: JSON.stringify(body),
    });

    if (res.ok) {
      toast.success("Link updated!");

      setOpen(false);

      router.refresh();
    } else {
      const { error } = await res.json();

      toast.error("Error", {
        description: formatApiError(error),
      });
    }

    setLoading(false);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-2">
          <Pencil className="w-4 h-4" /> Edit
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit link</DialogTitle>
        </DialogHeader>

        <div className="space-y-5 py-2">
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

          <Separator />

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium flex items-center gap-2">
                <Lock className="w-3.5 h-3.5" />
                Password protection
              </p>

              {link.isProtected && (
                <Badge variant="secondary" className="gap-1 text-xs">
                  <Lock className="w-3 h-3" /> Protected
                </Badge>
              )}
            </div>

            {link.isProtected && !form.removePassword && (
              <div className="space-y-3">
                <PasswordInput
                  value={form.newPassword}
                  onChange={(val) => setForm({ ...form, newPassword: val })}
                  label="Change password"
                  placeholder="Enter new password to replace"
                  hint="Leave blank to keep the current password."
                />

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="gap-2 text-destructive hover:text-destructive"
                  onClick={() =>
                    setForm({ ...form, removePassword: true, newPassword: "" })
                  }
                >
                  <ShieldOff className="w-4 h-4" />
                  Remove password protection
                </Button>
              </div>
            )}

            {link.isProtected && form.removePassword && (
              <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-3 space-y-2">
                <p className="text-sm text-destructive">
                  Password protection will be removed. Anyone with the link can
                  access it.
                </p>

                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setForm({ ...form, removePassword: false })}
                >
                  Cancel — keep password
                </Button>
              </div>
            )}

            {!link.isProtected && (
              <PasswordInput
                value={form.newPassword}
                onChange={(val) => setForm({ ...form, newPassword: val })}
                label="Add password"
                placeholder="Set a password for this link"
              />
            )}
          </div>

          <Separator />

          <UtmBuilder
            values={utmValues}
            onChange={setUtmValues}
            originalUrl={link.originalUrl}
          />
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>

          <Button onClick={handleSave} disabled={loading}>
            {loading ? "Saving..." : "Save changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
