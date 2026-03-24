"use client";

import dynamic from "next/dynamic";

const BlogPostEditor = dynamic(
  () => import("@/features/blog/components/blog-post-editor").then((m) => ({ default: m.BlogPostEditor })),
  { ssr: false, loading: () => <div className="h-[400px] animate-pulse rounded-lg bg-muted" /> }
);

export default function NovoBlogPostPage() {
  return <BlogPostEditor mode="create" />;
}
