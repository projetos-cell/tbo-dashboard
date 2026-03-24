"use client";

import { use } from "react";
import { useBlogPost } from "@/features/blog/hooks/use-blog-posts";
import dynamic from "next/dynamic";

const BlogPostEditor = dynamic(
  () => import("@/features/blog/components/blog-post-editor").then((m) => ({ default: m.BlogPostEditor })),
  { ssr: false, loading: () => <div className="h-[400px] animate-pulse rounded-lg bg-muted" /> }
);
import { Skeleton } from "@/components/ui/skeleton";

export default function EditBlogPostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { data: post, isLoading } = useBlogPost(id);

  if (isLoading) {
    return (
      <div className="p-6 space-y-4 max-w-3xl mx-auto">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-muted-foreground">Artigo nao encontrado</p>
      </div>
    );
  }

  return <BlogPostEditor post={post} mode="edit" />;
}
