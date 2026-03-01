CREATE TABLE model_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  user_email TEXT NOT NULL,
  provider TEXT NOT NULL,
  model TEXT NOT NULL,
  feature TEXT NOT NULL,
  prompt_tokens INTEGER NOT NULL DEFAULT 0,
  completion_tokens INTEGER NOT NULL DEFAULT 0,
  total_tokens INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX ON model_usage (user_id, created_at DESC);
CREATE INDEX ON model_usage (model, created_at DESC);

ALTER TABLE model_usage ENABLE ROW LEVEL SECURITY;

-- Users can insert their own records
CREATE POLICY "Users insert own usage"
  ON model_usage FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Admins (app_metadata.is_admin = true) can read all records
CREATE POLICY "Admins view all usage"
  ON model_usage FOR SELECT
  USING ((auth.jwt() -> 'app_metadata' ->> 'is_admin')::boolean = true);
