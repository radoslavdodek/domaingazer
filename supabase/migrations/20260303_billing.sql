CREATE TABLE IF NOT EXISTS billing_customers (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  stripe_customer_id TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS subscriptions (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  stripe_customer_id TEXT NOT NULL,
  stripe_subscription_id TEXT NOT NULL UNIQUE,
  stripe_price_id TEXT NOT NULL,
  status TEXT NOT NULL,
  plan_interval TEXT NOT NULL CHECK (plan_interval IN ('month', 'year')),
  current_period_end TIMESTAMPTZ,
  cancel_at_period_end BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS credit_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  feature TEXT NOT NULL CHECK (feature IN ('search', 'explain')),
  credits_used INTEGER NOT NULL CHECK (credits_used >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS subscriptions_user_id_updated_at_idx ON subscriptions (user_id, updated_at DESC);
CREATE INDEX IF NOT EXISTS credit_usage_user_id_created_at_idx ON credit_usage (user_id, created_at DESC);

ALTER TABLE billing_customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE credit_usage ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own billing customer"
  ON billing_customers FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users view own subscriptions"
  ON subscriptions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users view own credit usage"
  ON credit_usage FOR SELECT
  USING (auth.uid() = user_id);
