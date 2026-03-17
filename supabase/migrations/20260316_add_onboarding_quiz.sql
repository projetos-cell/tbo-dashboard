-- Add onboarding_quiz JSONB column to profiles
-- Stores quiz results per day: { "day_1": { answers, score, total, passed, completed_at }, ... }
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS onboarding_quiz jsonb DEFAULT '{}'::jsonb;

COMMENT ON COLUMN profiles.onboarding_quiz IS 'Onboarding quiz progress per day (JSONB). Keys: day_1..day_5';
