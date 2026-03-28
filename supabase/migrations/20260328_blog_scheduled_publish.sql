-- ============================================================
-- TBO OS — Publicacao agendada de blog posts
-- Adiciona status 'agendado' + cron job para auto-publicar
-- ============================================================

-- 1. Adicionar 'agendado' ao enum
ALTER TYPE public.blog_post_status ADD VALUE IF NOT EXISTS 'agendado' AFTER 'revisao';

-- 2. Funcao que publica posts agendados cujo published_at ja passou
CREATE OR REPLACE FUNCTION public.publish_scheduled_blog_posts()
RETURNS INTEGER AS $$
DECLARE
  affected INTEGER;
BEGIN
  UPDATE public.blog_posts
  SET status = 'publicado'
  WHERE status = 'agendado'
    AND published_at IS NOT NULL
    AND published_at <= now();

  GET DIAGNOSTICS affected = ROW_COUNT;
  RETURN affected;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Cron job: roda a cada 5 minutos para publicar posts agendados
SELECT cron.schedule(
  'publish-scheduled-blog-posts',
  '*/5 * * * *',
  $$SELECT public.publish_scheduled_blog_posts()$$
);
