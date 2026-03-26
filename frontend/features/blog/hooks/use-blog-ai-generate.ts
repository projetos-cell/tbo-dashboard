import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

interface BlogGenerateParams {
  topic: string;
  tone: "ruy" | "marco" | "tbo";
  additionalInstructions?: string;
}

interface BlogGenerateResult {
  title: string;
  excerpt: string;
  tags: string[];
  body: string;
}

async function generateBlogPost(
  params: BlogGenerateParams,
): Promise<BlogGenerateResult> {
  const res = await fetch("/api/ai/blog-generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });

  if (!res.ok) {
    const err = (await res.json()) as { error?: string };
    throw new Error(err.error ?? "Erro ao gerar artigo");
  }

  return res.json() as Promise<BlogGenerateResult>;
}

export function useBlogAiGenerate() {
  return useMutation({
    mutationFn: generateBlogPost,
    onError: (err: Error) => {
      toast.error(err.message);
    },
  });
}
