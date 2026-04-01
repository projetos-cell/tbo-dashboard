"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence, LayoutGroup } from "framer-motion";
import { useAuthStore } from "@/stores/auth-store";

/* ─── Hub Components ──────────────────────────────────────────── */
import { GreetingBar } from "@/features/hub/components/greeting-bar";
import { NoticesWidget } from "@/features/hub/components/notices-widget";
import { AbsencesWidget } from "@/features/hub/components/absences-widget";
import { CalendarWidget } from "@/features/hub/components/calendar-widget";
import { ChatWidget } from "@/features/hub/components/chat-widget";
import { ProjectsWidget } from "@/features/hub/components/projects-widget";
import { DocumentsWidget } from "@/features/hub/components/documents-widget";
import { BirthdayWidget } from "@/features/hub/components/birthday-widget";
import { CategoryNavCards } from "@/features/hub/components/category-filter";
import { PostComposer } from "@/features/hub/components/post-composer";
import { FeedPost } from "@/features/hub/components/feed-post";
import { NewPostsBadge } from "@/features/hub/components/new-posts-badge";
import { FeedSearch } from "@/features/hub/components/feed-search";
import { AnnouncementBanner } from "@/features/hub/components/announcement-banner";
import { OnboardingProgressWidget } from "@/features/hub/components/onboarding-progress";
import {
  CategoriesSkeleton,
  CalendarSkeleton,
  SocialCardSkeleton,
  PostComposerSkeleton,
  FeedPostSkeleton,
  ProjectsSkeleton,
  DocumentsSkeleton,
} from "@/features/hub/components/hub-skeletons";

/* ─── Feed Hooks ──────────────────────────────────────────────── */
import { useHubPosts } from "@/features/hub/hooks/use-hub-posts";
import { useUserLikes } from "@/features/hub/hooks/use-hub-like";
import { useHubRealtime } from "@/features/hub/hooks/use-hub-realtime";

/* ─── Loading Skeleton ────────────────────────────────────────── */

function HubSkeleton() {
  return (
    <div className="-mx-4 md:-mx-8 lg:-mx-12 -my-6">
      <div className="flex gap-0 min-h-[calc(100dvh-64px)]">
        <aside className="hidden lg:flex flex-col w-[260px] shrink-0 p-4 gap-4 bg-hub-bg/50 backdrop-blur-lg border-r border-glass-border">
          <CategoriesSkeleton />
          <CalendarSkeleton />
          <SocialCardSkeleton />
        </aside>
        <main className="flex-1 min-w-0 p-5 space-y-4">
          <PostComposerSkeleton />
          <FeedPostSkeleton />
          <FeedPostSkeleton />
        </main>
        <aside className="hidden xl:flex flex-col w-[300px] shrink-0 p-4 gap-4 bg-hub-bg/50 backdrop-blur-lg border-l border-glass-border">
          <ProjectsSkeleton />
          <DocumentsSkeleton />
        </aside>
      </div>
    </div>
  );
}

/* ─── Page ────────────────────────────────────────────────────── */

export default function HubServicosPage() {
  const user = useAuthStore((s) => s.user);

  const fullName = useMemo(() => {
    if (!user) return "Usuario";
    return (
      (user.user_metadata?.full_name as string) ||
      user.email?.split("@")[0] ||
      "Usuario"
    );
  }, [user]);

  const initials = fullName
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
  const avatarUrl = user?.user_metadata?.avatar_url as string | undefined;
  const userRole = (user?.user_metadata?.role as string) ?? "";

  /* ─── Feed state ───────────────────────────────────────────── */
  const [searchQuery, setSearchQuery] = useState("");

  const { data: posts = [], isLoading: postsLoading } = useHubPosts({
    search: searchQuery || undefined,
  });

  const postIds = useMemo(() => posts.map((p) => p.id), [posts]);
  const { data: userLikes = new Set<string>() } = useUserLikes(postIds);

  const { newCount, loadNew } = useHubRealtime();

  /* ─── Show skeleton while auth loads ───────────────────────── */
  if (!user) return <HubSkeleton />;

  return (
    <div className="-mx-4 md:-mx-8 lg:-mx-12 -my-6">
      <div className="flex gap-0 min-h-[calc(100dvh-64px)]">
        {/* ─── Left Sidebar ──────────────────────────────────── */}
        <aside className="hidden lg:flex flex-col w-[260px] shrink-0 p-4 gap-4 bg-hub-bg/50 backdrop-blur-lg border-r border-glass-border">
          <OnboardingProgressWidget />
          <NoticesWidget />
          <AbsencesWidget />
          <CalendarWidget />
          <BirthdayWidget />
        </aside>

        {/* ─── Center Feed ───────────────────────────────────── */}
        <main className="flex-1 min-w-0 p-5 space-y-4">
          <GreetingBar
            firstName={fullName.split(" ")[0]}
            avatarUrl={avatarUrl}
          />
          <FeedSearch value={searchQuery} onChange={setSearchQuery} />
          <AnnouncementBanner />
          <CategoryNavCards />

          <PostComposer
            avatarUrl={avatarUrl}
            initials={initials}
            fullName={fullName}
            role={userRole}
          />

          <NewPostsBadge count={newCount} onLoad={loadNew} />

          {postsLoading ? (
            <div className="space-y-4">
              <FeedPostSkeleton />
              <FeedPostSkeleton />
            </div>
          ) : (
            <LayoutGroup>
              <AnimatePresence mode="popLayout">
                {posts.length === 0 ? (
                  <motion.div
                    key="empty"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.25 }}
                    className="text-center py-16"
                  >
                    <p className="text-sm font-medium text-muted-foreground">
                      {searchQuery
                        ? `Nenhum resultado para "${searchQuery}"`
                        : "Nenhum post nesta categoria"}
                    </p>
                    <p className="text-xs mt-1 text-muted-foreground">
                      {searchQuery
                        ? "Tente buscar com outros termos"
                        : "Seja o primeiro a compartilhar algo"}
                    </p>
                  </motion.div>
                ) : (
                  posts.map((post, idx) => (
                    <motion.div
                      key={post.id}
                      layout
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8, scale: 0.98 }}
                      transition={{
                        duration: 0.3,
                        delay: idx * 0.05,
                        layout: {
                          type: "spring",
                          stiffness: 300,
                          damping: 24,
                        },
                      }}
                    >
                      <FeedPost
                        post={post}
                        userLiked={userLikes.has(post.id)}
                      />
                    </motion.div>
                  ))
                )}
              </AnimatePresence>
            </LayoutGroup>
          )}
        </main>

        {/* ─── Right Sidebar ─────────────────────────────────── */}
        <aside className="hidden xl:flex flex-col w-[300px] shrink-0 p-4 gap-4 bg-hub-bg/50 backdrop-blur-lg border-l border-glass-border">
          <ChatWidget />
          <ProjectsWidget />
          <DocumentsWidget />
        </aside>
      </div>
    </div>
  );
}
