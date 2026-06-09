"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";
import { Card } from "@/shared/components/ui/Card";
import { Spinner } from "@/shared/components/ui/Spinner";

interface QrPreviewProps {
  value: string;
}

export function QrPreview({ value }: QrPreviewProps) {
  const [qrDataUrl, setQrDataUrl] = useState("");

  useEffect(() => {
    let mounted = true;

    QRCode.toDataURL(value, {
      width: 192,
      margin: 1,
      color: {
        dark: "#1f2933",
        light: "#ffffff"
      }
    }).then((dataUrl) => {
      if (mounted) {
        setQrDataUrl(dataUrl);
      }
    });

    return () => {
      mounted = false;
    };
  }, [value]);

  if (!qrDataUrl) {
    return (
      <Card className="grid max-w-xs gap-3 p-4">
        <Spinner label="Preparing QR" className="text-stone-600" />
      </Card>
    );
  }

  return (
    <Card className="motion-enter grid max-w-xs gap-3 p-4">
      <img src={qrDataUrl} alt="QR code for local photo page" className="w-48" />
      <p className="text-sm font-medium text-stone-600">
        Local QR: opens this photo in the same browser storage until cloud sharing is
        added.
      </p>
    </Card>
  );
}
