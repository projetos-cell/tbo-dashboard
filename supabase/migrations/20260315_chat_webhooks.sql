-- #46 — Webhook / Bot messages
-- Stores incoming webhook configs for channels

CREATE TABLE IF NOT EXISTS chat_webhooks (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id    UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  channel_id   UUID NOT NULL REFERENCES chat_channels(id) ON DELETE CASCADE,
  name         TEXT NOT NULL,
  token        TEXT NOT NULL DEFAULT encode(gen_random_bytes(32), 'hex'),
  created_by   UUID REFERENCES profiles(id) ON DELETE SET NULL,
  is_active    BOOLEAN NOT NULL DEFAULT true,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_chat_webhooks_channel ON chat_webhooks(channel_id);
CREATE INDEX IF NOT EXISTS idx_chat_webhooks_token  ON chat_webhooks(token);

ALTER TABLE chat_webhooks ENABLE ROW LEVEL SECURITY;

-- Only members of the channel's tenant can see webhooks
CREATE POLICY "tenant_read_webhooks" ON chat_webhooks
  FOR SELECT USING (tenant_id IN (SELECT unnest(get_user_tenant_ids())));

-- Only admins/founders can manage webhooks (enforced at app level via RBAC + RLS for writes)
CREATE POLICY "tenant_manage_webhooks" ON chat_webhooks
  FOR ALL USING (tenant_id IN (SELECT unnest(get_user_tenant_ids())));

COMMENT ON TABLE chat_webhooks IS
  'Incoming webhooks for chat channels. POST to the webhook URL to deliver bot messages.';
