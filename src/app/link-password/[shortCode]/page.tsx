import { notFound } from "next/navigation";
import { getLinkByShortCode } from "@/lib/services/links";
import { PasswordForm } from "./password-form";
import { Lock } from "lucide-react";

export default async function LinkPasswordPage({
  params,
}: {
  params: Promise<{ shortCode: string }>;
}) {
  const { shortCode } = await params;
  const link = await getLinkByShortCode(shortCode);

  // If link doesn't exist or isn't protected, bail out
  if (!link || !link.isProtected) notFound();

  // Don't reveal the destination URL to the visitor
  const displayName = link.title ?? `/${link.shortCode}`;

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/40 px-4">
      <div className="w-full max-w-sm space-y-6">

        {/* Icon + heading */}
        <div className="text-center space-y-3">
          <div className="mx-auto w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
            <Lock className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Protected link</h1>
            <p className="text-muted-foreground text-sm mt-1">
              <span className="font-medium text-foreground">{displayName}</span>
              {" "}requires a password to continue.
            </p>
          </div>
        </div>

        {/* Password form (client component) */}
        <PasswordForm shortCode={shortCode} />

        {/* Footer note */}
        <p className="text-center text-xs text-muted-foreground">
          This link is protected by{" "}
          <a href="/" className="underline underline-offset-4 hover:text-foreground">
            Snip
          </a>
        </p>

      </div>
    </div>
  );
}