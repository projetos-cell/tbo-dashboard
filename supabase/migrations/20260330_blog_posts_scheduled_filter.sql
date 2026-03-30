-- ============================================================
-- Fix: policy pública agora respeita published_at para agendamento
-- Posts com published_at futuro ficam ocultos do site público
-- ============================================================

DROP POLICY IF EXISTS "blog_posts_public_select" ON public.blog_posts;
CREATE POLICY "blog_posts_public_select" ON public.blog_posts
  FOR SELECT USING (
    status = 'publicado'
    AND (published_at IS NULL OR published_at <= now())
  );
