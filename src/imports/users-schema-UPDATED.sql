-- ═══════════════════════════════════════════════════════════════
-- TABLE 1 : users_julaba
-- VERSION MISE À JOUR avec rôles Back-Office
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS users_julaba (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  phone VARCHAR(10) UNIQUE NOT NULL CHECK (phone ~ '^[0-9]{10}$'),
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  role VARCHAR(20) NOT NULL CHECK (role IN ('marchand', 'producteur', 'cooperative', 'institution', 'identificateur', 'consommateur', 'super_admin', 'admin_national', 'gestionnaire_zone', 'analyste')),
  region VARCHAR(50),
  commune VARCHAR(100),
  activity VARCHAR(100),
  market VARCHAR(100),
  cooperative_name VARCHAR(200),
  institution_name VARCHAR(200),
  score INTEGER DEFAULT 50 CHECK (score >= 0 AND score <= 100),
  validated BOOLEAN DEFAULT FALSE,
  verified_phone BOOLEAN DEFAULT FALSE,
  photo_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_login_at TIMESTAMP WITH TIME ZONE
);

-- Index pour performance
CREATE INDEX IF NOT EXISTS idx_users_phone ON users_julaba(phone);
CREATE INDEX IF NOT EXISTS idx_users_auth_id ON users_julaba(auth_user_id);
CREATE INDEX IF NOT EXISTS idx_users_role ON users_julaba(role);
CREATE INDEX IF NOT EXISTS idx_users_region ON users_julaba(region);

-- Trigger pour updated_at automatique
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_julaba_updated_at
  BEFORE UPDATE ON users_julaba
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ═══════════════════════════════════════════════════════════════
-- TABLE 2 : kv_store_488793d3
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS kv_store_488793d3 (
  key TEXT NOT NULL PRIMARY KEY,
  value JSONB NOT NULL
);

-- Index pour recherche par préfixe
CREATE INDEX IF NOT EXISTS idx_kv_key_prefix ON kv_store_488793d3 USING btree (key text_pattern_ops);

-- ═══════════════════════════════════════════════════════════════
-- DONNÉES DE TEST (Optionnel)
-- ═══════════════════════════════════════════════════════════════

-- Paramètres système par défaut
INSERT INTO kv_store_488793d3 (key, value) VALUES
  ('system:support_phone', '"0700000000"'::jsonb)
ON CONFLICT (key) DO NOTHING;
