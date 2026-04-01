-- User task bookmarks: personal saved/bookmarked tasks per user
CREATE TABLE IF NOT EXISTS public.user_task_bookmarks (
  user_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  task_id    UUID NOT NULL REFERENCES public.os_tasks(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, task_id)
);

ALTER TABLE public.user_task_bookmarks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage their own task bookmarks"
  ON public.user_task_bookmarks FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS user_task_bookmarks_user_id_idx
  ON public.user_task_bookmarks (user_id);
