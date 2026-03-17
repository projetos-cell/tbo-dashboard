"use client";

// Re-exports RSM hooks for the Marketing > Redes Sociais module.
// This wrapper keeps the marketing module self-contained while
// reusing the existing RSM infrastructure.

export {
  useRsmAccounts,
  useRsmAccount,
  useRsmPosts,
  useCreateRsmPost,
  useUpdateRsmPost,
  useDeleteRsmPost,
  useRsmIdeas,
  useCreateRsmIdea,
  useUpdateRsmIdea,
  useDeleteRsmIdea,
  useRsmMetrics,
} from "@/hooks/use-rsm";
