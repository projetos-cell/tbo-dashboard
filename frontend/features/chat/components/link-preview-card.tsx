"use client";

import { useQuery } from "@tanstack/react-query";

interface LinkPreview {
  title: string | null;
  description: string | null;
  image: string | null;
  siteName: string | null;
  hostname: string;
  url: string;
}

async function fetchLinkPreview(url: string): Promise<LinkPreview> {
  const res = await fetch(`/api/chat/link-preview?url=${encodeURIComponent(url)}`);
  if (!res.ok) throw new Error("Failed");
  return res.json() as Promise<LinkPreview>;
}

export function LinkPreviewCard({ url }: { url: string }) {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["link-preview", url],
    queryFn: () => fetchLinkPreview(url),
    staleTime: 1000 * 60 * 60,
    retry: false,
  });

  if (isLoading) {
    return (
      <div className="mt-1.5 flex gap-3 rounded-lg border bg-muted/30 p-2.5 max-w-xs animate-pulse">
        <div className="h-3 w-3/4 rounded bg-muted" />
      </div>
    );
  }

  if (isError || !data || (!data.title && !data.description)) return null;

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="mt-1.5 flex gap-3 rounded-lg border bg-muted/30 p-2.5 hover:bg-muted/50 transition-colors max-w-xs no-underline"
    >
      {data.image && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={data.image}
          alt=""
          className="h-14 w-14 rounded object-cover shrink-0"
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = "none";
          }}
        />
      )}
      <div className="flex flex-col gap-0.5 min-w-0">
        {data.title && (
          <span className="text-xs font-medium leading-snug line-clamp-2 text-foreground">
            {data.title}
          </span>
        )}
        {data.description && (
          <span className="text-[11px] text-muted-foreground line-clamp-2">{data.description}</span>
        )}
        <span className="text-[10px] text-muted-foreground/60">
          {data.siteName ? `${data.siteName} · ` : ""}
          {data.hostname}
        </span>
      </div>
    </a>
  );
}

/** Extract the first URL from plain-text message content. Returns null for HTML content. */
export function extractFirstUrl(content: string): string | null {
  if (content.trimStart().startsWith("<")) return null;
  const match = content.match(/https?:\/\/[^\s<>"{}|\\^`[\]]+/);
  return match?.[0] ?? null;
}
