CREATE TABLE IF NOT EXISTS free_credit_entitlements (
  email_hash TEXT PRIMARY KEY,
  google_subject_hash TEXT UNIQUE,
  lifetime_credits_used INTEGER NOT NULL DEFAULT 0 CHECK (lifetime_credits_used >= 0),
  first_seen_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_seen_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_account_count INTEGER NOT NULL DEFAULT 0 CHECK (deleted_account_count >= 0)
);

CREATE OR REPLACE FUNCTION ensure_free_credit_entitlement(
  p_email_hash TEXT,
  p_google_subject_hash TEXT DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  IF p_email_hash IS NULL OR length(trim(p_email_hash)) = 0 THEN
    RAISE EXCEPTION 'p_email_hash is required';
  END IF;

  IF p_google_subject_hash IS NOT NULL AND length(trim(p_google_subject_hash)) > 0 THEN
    UPDATE free_credit_entitlements
    SET
      email_hash = p_email_hash,
      last_seen_at = NOW()
    WHERE google_subject_hash = p_google_subject_hash
      AND email_hash <> p_email_hash
      AND NOT EXISTS (
        SELECT 1
        FROM free_credit_entitlements existing
        WHERE existing.email_hash = p_email_hash
      );
  END IF;

  INSERT INTO free_credit_entitlements (email_hash, google_subject_hash)
  VALUES (p_email_hash, p_google_subject_hash)
  ON CONFLICT (email_hash) DO UPDATE
  SET
    google_subject_hash = COALESCE(free_credit_entitlements.google_subject_hash, EXCLUDED.google_subject_hash),
    last_seen_at = NOW();
END;
$$;

CREATE OR REPLACE FUNCTION consume_free_credits(
  p_email_hash TEXT,
  p_google_subject_hash TEXT DEFAULT NULL,
  p_credits INTEGER DEFAULT 0
)
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  IF p_email_hash IS NULL OR length(trim(p_email_hash)) = 0 THEN
    RAISE EXCEPTION 'p_email_hash is required';
  END IF;

  IF p_credits IS NULL OR p_credits < 0 THEN
    RAISE EXCEPTION 'p_credits must be a non-negative integer';
  END IF;

  IF p_google_subject_hash IS NOT NULL AND length(trim(p_google_subject_hash)) > 0 THEN
    UPDATE free_credit_entitlements
    SET
      email_hash = p_email_hash,
      last_seen_at = NOW()
    WHERE google_subject_hash = p_google_subject_hash
      AND email_hash <> p_email_hash
      AND NOT EXISTS (
        SELECT 1
        FROM free_credit_entitlements existing
        WHERE existing.email_hash = p_email_hash
      );
  END IF;

  INSERT INTO free_credit_entitlements (email_hash, google_subject_hash, lifetime_credits_used)
  VALUES (p_email_hash, p_google_subject_hash, p_credits)
  ON CONFLICT (email_hash) DO UPDATE
  SET
    google_subject_hash = COALESCE(free_credit_entitlements.google_subject_hash, EXCLUDED.google_subject_hash),
    lifetime_credits_used = free_credit_entitlements.lifetime_credits_used + p_credits,
    last_seen_at = NOW();
END;
$$;

CREATE OR REPLACE FUNCTION sync_free_credit_entitlement_floor(
  p_email_hash TEXT,
  p_google_subject_hash TEXT DEFAULT NULL,
  p_min_credits INTEGER DEFAULT 0
)
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  IF p_email_hash IS NULL OR length(trim(p_email_hash)) = 0 THEN
    RAISE EXCEPTION 'p_email_hash is required';
  END IF;

  IF p_min_credits IS NULL OR p_min_credits < 0 THEN
    RAISE EXCEPTION 'p_min_credits must be a non-negative integer';
  END IF;

  IF p_google_subject_hash IS NOT NULL AND length(trim(p_google_subject_hash)) > 0 THEN
    UPDATE free_credit_entitlements
    SET
      email_hash = p_email_hash,
      last_seen_at = NOW()
    WHERE google_subject_hash = p_google_subject_hash
      AND email_hash <> p_email_hash
      AND NOT EXISTS (
        SELECT 1
        FROM free_credit_entitlements existing
        WHERE existing.email_hash = p_email_hash
      );
  END IF;

  INSERT INTO free_credit_entitlements (email_hash, google_subject_hash, lifetime_credits_used)
  VALUES (p_email_hash, p_google_subject_hash, p_min_credits)
  ON CONFLICT (email_hash) DO UPDATE
  SET
    google_subject_hash = COALESCE(free_credit_entitlements.google_subject_hash, EXCLUDED.google_subject_hash),
    lifetime_credits_used = GREATEST(free_credit_entitlements.lifetime_credits_used, p_min_credits),
    last_seen_at = NOW();
END;
$$;

CREATE OR REPLACE FUNCTION mark_free_credit_entitlement_deleted(
  p_email_hash TEXT,
  p_google_subject_hash TEXT DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  IF p_email_hash IS NULL OR length(trim(p_email_hash)) = 0 THEN
    RAISE EXCEPTION 'p_email_hash is required';
  END IF;

  IF p_google_subject_hash IS NOT NULL AND length(trim(p_google_subject_hash)) > 0 THEN
    UPDATE free_credit_entitlements
    SET
      email_hash = p_email_hash,
      last_seen_at = NOW()
    WHERE google_subject_hash = p_google_subject_hash
      AND email_hash <> p_email_hash
      AND NOT EXISTS (
        SELECT 1
        FROM free_credit_entitlements existing
        WHERE existing.email_hash = p_email_hash
      );
  END IF;

  INSERT INTO free_credit_entitlements (email_hash, google_subject_hash, deleted_account_count)
  VALUES (p_email_hash, p_google_subject_hash, 1)
  ON CONFLICT (email_hash) DO UPDATE
  SET
    google_subject_hash = COALESCE(free_credit_entitlements.google_subject_hash, EXCLUDED.google_subject_hash),
    deleted_account_count = free_credit_entitlements.deleted_account_count + 1,
    last_seen_at = NOW();
END;
$$;
