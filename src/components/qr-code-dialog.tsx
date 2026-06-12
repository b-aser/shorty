"use client";

import { QRCodeCanvas } from "qrcode.react";
import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogHeader,
  DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { QrCode, Download } from "lucide-react";

export function QrCodeDialog({ shortUrl, title }: { shortUrl: string; title?: string }) {
  function downloadQr() {
    const canvas = document.getElementById("qr-canvas") as HTMLCanvasElement;
    if (!canvas) return;
    const url = canvas.toDataURL("image/png");
    const a   = document.createElement("a");
    a.href     = url;
    a.download = `${title ?? "qr-code"}.png`;
    a.click();
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <QrCode className="w-4 h-4" /> QR Code
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>QR Code</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col items-center gap-6 py-4">
          <QRCodeCanvas
            id="qr-canvas"
            value={shortUrl}
            size={220}
            bgColor="#ffffff"
            fgColor="#000000"
            level="H"
            includeMargin
          />
          <p className="text-sm text-muted-foreground text-center break-all">
            {shortUrl}
          </p>
          <Button onClick={downloadQr} className="w-full gap-2">
            <Download className="w-4 h-4" /> Download PNG
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}