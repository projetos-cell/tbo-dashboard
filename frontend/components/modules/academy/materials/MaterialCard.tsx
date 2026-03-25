"use client";

import { IconDownload } from "@tabler/icons-react";
import { Badge } from "@/components/ui/badge";

interface MaterialCardProps {
  title: string;
  description: string;
  format: string;
  downloadUrl: string;
}

const FORMAT_COLORS: Record<string, string> = {
  pdf: "bg-red-500/10 text-red-500",
  figma: "bg-[#b8f724]/10 text-[#b8f724]",
  psd: "bg-blue-500/10 text-blue-500",
  zip: "bg-green-500/10 text-green-500",
};

export function MaterialCard({
  title,
  description,
  format,
  downloadUrl,
}: MaterialCardProps) {
  return (
    <div className="rounded-2xl border border-border/30 bg-secondary/20 p-5 backdrop-blur-sm transition-colors hover:bg-secondary/30">
      <div className="mb-3 flex items-start justify-between">
        <div className="flex-1">
          <h4 className="mb-1 font-semibold">{title}</h4>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
        <Badge
          variant="secondary"
          className={`ml-2 shrink-0 uppercase ${FORMAT_COLORS[format] ?? ""}`}
        >
          {format}
        </Badge>
      </div>
      <a
        href={downloadUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 rounded-lg bg-primary/10 px-4 py-2 text-sm font-medium text-primary transition-colors hover:bg-primary/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background"
      >
        <IconDownload className="h-4 w-4" />
        Download
      </a>
    </div>
  );
}
