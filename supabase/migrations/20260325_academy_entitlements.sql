-- Academy entitlements for product access control
CREATE TABLE IF NOT EXISTS public.academy_entitlements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_slug TEXT NOT NULL CHECK (product_slug IN ('diagnostic', 'essencial', 'profissional', 'enterprise')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'expired', 'cancelled', 'trial')),
  stripe_subscription_id TEXT,
  stripe_customer_id TEXT,
  starts_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, product_slug)
);

-- Indexes
CREATE INDEX idx_academy_entitlements_user ON public.academy_entitlements(user_id);
CREATE INDEX idx_academy_entitlements_status ON public.academy_entitlements(status);
CREATE INDEX idx_academy_entitlements_stripe ON public.academy_entitlements(stripe_subscription_id);

-- RLS
ALTER TABLE public.academy_entitlements ENABLE ROW LEVEL SECURITY;

-- Users can read their own entitlements
CREATE POLICY "users_read_own_entitlements" ON public.academy_entitlements
  FOR SELECT USING (auth.uid() = user_id);

-- Founders and diretoria can read all entitlements
CREATE POLICY "admins_read_all_entitlements" ON public.academy_entitlements
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.tenant_members tm
      JOIN public.roles r ON r.id = tm.role_id
      WHERE tm.user_id = auth.uid()
      AND r.slug IN ('founder', 'diretoria')
    )
  );

-- Only service role can insert/update/delete (via webhooks)
CREATE POLICY "service_role_manage_entitlements" ON public.academy_entitlements
  FOR ALL USING (auth.role() = 'service_role');

-- Updated_at trigger
CREATE OR REPLACE FUNCTION update_academy_entitlements_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_academy_entitlements_updated_at
  BEFORE UPDATE ON public.academy_entitlements
  FOR EACH ROW EXECUTE FUNCTION update_academy_entitlements_updated_at();
