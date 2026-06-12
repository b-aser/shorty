"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { MoreHorizontal, Copy, Trash2, BarChart2, Lock } from "lucide-react";
import { QrCodeDialog } from "./qr-code-dialog";
import { EditLinkDialog } from "./edit-link-dialog";
import { hasUtmParams } from "@/lib/utm";

// Update LinkRow type — add UTM fields
type LinkRow = {
  id:          string;
  title:       string | null;
  originalUrl: string;
  shortCode:   string;
  clicks:      number;
  active:      boolean;
  isProtected: boolean;
  utmSource:   string | null;
  utmMedium:   string | null;
  utmCampaign: string | null;
  utmTerm:     string | null;
  utmContent:  string | null;
  expiresAt:   string | null;
  createdAt:   string;
};

export function LinksTable({
  links,
  appUrl,
}: {
  links: LinkRow[];
  appUrl: string;
}) {
  const router = useRouter();
  const [toggling, setToggling] = useState<string | null>(null);

  async function copyShortLink(shortCode: string) {
    await navigator.clipboard.writeText(`${appUrl}/${shortCode}`);
    toast.success("Copied!", { description: `${appUrl}/${shortCode}` });
  }

  async function toggleActive(id: string, current: boolean) {
    setToggling(id);
    await fetch(`/api/links/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: !current }),
    });
    router.refresh();
    setToggling(null);
  }

  async function deleteLink(id: string) {
    if (!confirm("Delete this link? This cannot be undone.")) return;
    await fetch(`/api/links/${id}`, { method: "DELETE" });
    toast.success("Link deleted");
    router.refresh();
  }

  if (links.length === 0) {
    return (
      <div className="text-center py-16 text-muted-foreground">
        No links yet — shorten your first URL above!
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Short Link</TableHead>
          <TableHead className="hidden md:table-cell">Destination</TableHead>
          <TableHead className="text-center">Clicks</TableHead>
          <TableHead className="text-center">Status</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {links.map((link) => {
          const shortUrl = `${appUrl}/${link.shortCode}`;
          const isExpired =
            link.expiresAt && new Date() > new Date(link.expiresAt);

          return (
            <TableRow key={link.id}>
              <TableCell>
                <div className="flex items-center gap-1.5 font-medium">
                  {link.title ?? link.shortCode}
                  {link.isProtected && (
                    <Lock className="w-3 h-3 text-muted-foreground shrink-0" />
                  )}
                  {hasUtmParams(link) && (
                    <Badge variant="outline" className="text-xs px-1 py-0 h-4">
                      UTM
                    </Badge>
                  )}
                </div>
                <button
                  onClick={() => copyShortLink(link.shortCode)}
                  className="text-xs text-primary hover:underline truncate max-w-[160px] block text-left"
                >
                  {shortUrl}
                </button>
              </TableCell>

              <TableCell className="hidden md:table-cell">
                <span className="text-sm text-muted-foreground truncate max-w-[240px] block">
                  {link.originalUrl}
                </span>
              </TableCell>

              <TableCell className="text-center">
                <Link href={`/dashboard/links/${link.id}`}>
                  <Badge variant="secondary" className="cursor-pointer gap-1">
                    <BarChart2 className="w-3 h-3" />
                    {link.clicks}
                  </Badge>
                </Link>
              </TableCell>

              <TableCell className="text-center">
                {isExpired ? (
                  <Badge variant="destructive">Expired</Badge>
                ) : (
                  <Switch
                    checked={link.active}
                    disabled={toggling === link.id}
                    onCheckedChange={() => toggleActive(link.id, link.active)}
                  />
                )}
              </TableCell>

              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="bg-background">
                    <DropdownMenuItem asChild>
                      <QrCodeDialog
                        shortUrl={shortUrl}
                        title={link.title ?? link.shortCode}
                      />
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => copyShortLink(link.shortCode)}
                    >
                      <Copy className="w-4 h-4 mr-2" /> Copy link
                    </DropdownMenuItem>

                    <DropdownMenuItem asChild>
                      <EditLinkDialog link={link} appUrl={appUrl} />
                    </DropdownMenuItem>

                    <DropdownMenuItem
                      onClick={() => deleteLink(link.id)}
                      className="text-destructive"
                    >
                      <Trash2 className="w-4 h-4 mr-2" /> Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
