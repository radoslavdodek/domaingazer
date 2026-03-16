CREATE TABLE user_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  user_email TEXT NOT NULL,
  title TEXT,
  message TEXT NOT NULL,
  category TEXT,
  priority TEXT DEFAULT 'medium',
  feedback_type TEXT DEFAULT 'general',
  page_url TEXT,
  user_agent TEXT,
  screen_info TEXT,
  attachments TEXT[],
  search_context JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX ON user_feedback (user_id, created_at DESC);
CREATE INDEX ON user_feedback (created_at DESC);

ALTER TABLE user_feedback ENABLE ROW LEVEL SECURITY;

-- Users can insert their own feedback
CREATE POLICY "Users insert own feedback"
  ON user_feedback FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can view their own feedback
CREATE POLICY "Users view own feedback"
  ON user_feedback FOR SELECT
  USING (auth.uid() = user_id);

-- Admins can view all feedback
CREATE POLICY "Admins view all feedback"
  ON user_feedback FOR SELECT
  USING ((auth.jwt() -> 'app_metadata' ->> 'is_admin')::boolean = true);

-- Storage bucket for feedback attachments
INSERT INTO storage.buckets (id, name, public)
VALUES ('feedback-attachments', 'feedback-attachments', false)
ON CONFLICT (id) DO NOTHING;

-- Authenticated users can upload to their own folder
CREATE POLICY "Users upload own feedback attachments"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'feedback-attachments'
    AND auth.role() = 'authenticated'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Users can read their own attachments
CREATE POLICY "Users read own feedback attachments"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'feedback-attachments'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Admins can read all feedback attachments
CREATE POLICY "Admins read all feedback attachments"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'feedback-attachments'
    AND (auth.jwt() -> 'app_metadata' ->> 'is_admin')::boolean = true
  );
