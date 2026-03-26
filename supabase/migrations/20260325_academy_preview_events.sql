-- Academy preview events for conversion funnel analytics
-- Tracks anonymous and authenticated user behavior during preview mode

CREATE TABLE IF NOT EXISTS public.academy_preview_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  event_type TEXT NOT NULL CHECK (event_type IN (
    'diagnostic_complete',
    'lesson_watched',
    'course_browsed',
    'pricing_viewed',
    'teaser_watched',
    'return_visit',
    'signup_started',
    'checkout_started'
  )),
  metadata JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX idx_academy_preview_events_session ON public.academy_preview_events(session_id);
CREATE INDEX idx_academy_preview_events_type ON public.academy_preview_events(event_type);
CREATE INDEX idx_academy_preview_events_created ON public.academy_preview_events(created_at);
CREATE INDEX idx_academy_preview_events_user ON public.academy_preview_events(user_id) WHERE user_id IS NOT NULL;

-- RLS
ALTER TABLE public.academy_preview_events ENABLE ROW LEVEL SECURITY;

-- Anyone can insert (anonymous preview users)
CREATE POLICY "anyone_can_insert_preview_events" ON public.academy_preview_events
  FOR INSERT WITH CHECK (true);

-- Only founders and diretoria can read (analytics)
CREATE POLICY "admins_read_preview_events" ON public.academy_preview_events
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.tenant_members tm
      JOIN public.roles r ON r.id = tm.role_id
      WHERE tm.user_id = auth.uid()
      AND r.slug IN ('founder', 'diretoria')
    )
  );

-- Service role full access
CREATE POLICY "service_role_manage_preview_events" ON public.academy_preview_events
  FOR ALL USING (auth.role() = 'service_role');
