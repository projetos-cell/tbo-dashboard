-- Sidebar order preferences per user (Notion-style reorderable sidebar)
-- Stores group order and item order within each group.

CREATE TABLE IF NOT EXISTS user_sidebar_preferences (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    group_order     JSONB NOT NULL DEFAULT '[]'::jsonb,
    group_items     JSONB NOT NULL DEFAULT '{}'::jsonb,
    collapsed       JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT uq_user_sidebar_pref UNIQUE (tenant_id, user_id)
);

-- RLS
ALTER TABLE user_sidebar_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own sidebar preferences"
    ON user_sidebar_preferences FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own sidebar preferences"
    ON user_sidebar_preferences FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own sidebar preferences"
    ON user_sidebar_preferences FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own sidebar preferences"
    ON user_sidebar_preferences FOR DELETE
    USING (auth.uid() = user_id);

-- Index
CREATE INDEX idx_sidebar_prefs_user ON user_sidebar_preferences(user_id);
