-- ============================================================
-- Policy pública: leitura anônima de posts publicados
-- Site wearetbo.com.br (Next.js) lê posts sem autenticação
-- ============================================================

DROP POLICY IF EXISTS "blog_posts_public_select" ON public.blog_posts;
CREATE POLICY "blog_posts_public_select" ON public.blog_posts
  FOR SELECT USING (status = 'publicado');
