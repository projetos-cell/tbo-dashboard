import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get("url");

  if (!url) return NextResponse.json({ error: "Missing url" }, { status: 400 });

  try {
    new URL(url); // validate
  } catch {
    return NextResponse.json({ error: "Invalid url" }, { status: 400 });
  }

  // Only allow http/https
  if (!url.startsWith("http://") && !url.startsWith("https://")) {
    return NextResponse.json({ error: "Invalid protocol" }, { status: 400 });
  }

  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; TBOBot/1.0; +https://agenciatbo.com.br)" },
      signal: AbortSignal.timeout(5000),
    });

    if (!res.ok) return NextResponse.json({ error: "Fetch failed" }, { status: 502 });

    const html = await res.text();

    function getMeta(property: string): string | null {
      const patterns = [
        new RegExp(`<meta[^>]+property=["']${property}["'][^>]+content=["']([^"']+)["']`, "i"),
        new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+property=["']${property}["']`, "i"),
        new RegExp(`<meta[^>]+name=["']${property}["'][^>]+content=["']([^"']+)["']`, "i"),
        new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+name=["']${property}["']`, "i"),
      ];
      for (const re of patterns) {
        const m = html.match(re);
        if (m?.[1]) return m[1].replace(/&amp;/g, "&").replace(/&#39;/g, "'").trim();
      }
      return null;
    }

    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    const title = getMeta("og:title") ?? getMeta("twitter:title") ?? titleMatch?.[1]?.trim() ?? null;
    const description = getMeta("og:description") ?? getMeta("twitter:description") ?? getMeta("description") ?? null;
    const image = getMeta("og:image") ?? getMeta("twitter:image") ?? null;
    const siteName = getMeta("og:site_name") ?? null;
    const hostname = new URL(url).hostname.replace(/^www\./, "");

    return NextResponse.json(
      { title, description, image, siteName, hostname, url },
      { headers: { "Cache-Control": "public, max-age=3600" } },
    );
  } catch {
    return NextResponse.json({ error: "Failed to fetch preview" }, { status: 502 });
  }
}
