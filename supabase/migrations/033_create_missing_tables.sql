-- Migration: create missing tables
-- user_sidebar_preferences, academy_pdi_skills, academy_pdi_actions

/* ------------------------------------------------------------------ */
/* user_sidebar_preferences                                            */
/* ------------------------------------------------------------------ */

CREATE TABLE IF NOT EXISTS user_sidebar_preferences (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id   UUID NOT NULL,
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  group_order JSONB NOT NULL DEFAULT '[]',
  group_items JSONB NOT NULL DEFAULT '{}',
  collapsed   JSONB NOT NULL DEFAULT '[]',
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, user_id)
);

ALTER TABLE user_sidebar_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own sidebar prefs"
  ON user_sidebar_preferences
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

/* ------------------------------------------------------------------ */
/* academy_pdi_skills                                                  */
/* ------------------------------------------------------------------ */

CREATE TABLE IF NOT EXISTS academy_pdi_skills (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name          TEXT NOT NULL,
  type          TEXT NOT NULL CHECK (type IN ('hard', 'soft')),
  current_level INT  NOT NULL DEFAULT 0,
  target_level  INT  NOT NULL DEFAULT 5,
  timeframe     TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE academy_pdi_skills ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own PDI skills"
  ON academy_pdi_skills
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

/* ------------------------------------------------------------------ */
/* academy_pdi_actions                                                 */
/* ------------------------------------------------------------------ */

CREATE TABLE IF NOT EXISTS academy_pdi_actions (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  action     TEXT NOT NULL,
  status     TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'done')),
  deadline   DATE,
  completed  BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE academy_pdi_actions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own PDI actions"
  ON academy_pdi_actions
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
