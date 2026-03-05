-- ═══════════════════════════════════════════════════════════════════
-- JÙLABA - SCHÉMA SUPABASE - MIGRATION PROGRESSIVE
-- ═══════════════════════════════════════════════════════════════════
-- Version : 1.0.0
-- Date : 5 mars 2026
-- Phase : SEMAINE 1 - Authentification + Profils utilisateurs
-- ═══════════════════════════════════════════════════════════════════

-- ───────────────────────────────────────────────────────────────────
-- TABLE 1 : USERS (Profils utilisateurs - 6 rôles)
-- ───────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS users_julaba (
  -- Identité
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Authentification
  phone VARCHAR(20) UNIQUE NOT NULL,
  email VARCHAR(255),
  
  -- Profil personnel
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  photo_url TEXT,
  
  -- Rôle (6 profils Jùlaba)
  role VARCHAR(20) NOT NULL CHECK (role IN (
    'marchand',
    'producteur', 
    'cooperative',
    'institution',
    'identificateur',
    'consommateur'
  )),
  
  -- Localisation
  region VARCHAR(100),
  commune VARCHAR(100),
  quartier VARCHAR(100),
  adresse_complete TEXT,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  
  -- Activité professionnelle
  activity TEXT,
  market VARCHAR(255),
  cooperative_name VARCHAR(255),
  institution_name VARCHAR(255),
  
  -- Score Jùlaba (0-100)
  score INTEGER DEFAULT 50 CHECK (score >= 0 AND score <= 100),
  
  -- Validation et statut
  validated BOOLEAN DEFAULT false,
  active BOOLEAN DEFAULT true,
  verified_phone BOOLEAN DEFAULT false,
  verified_email BOOLEAN DEFAULT false,
  
  -- KYC (Know Your Customer)
  id_card_number VARCHAR(50),
  id_card_photo_url TEXT,
  id_card_verified BOOLEAN DEFAULT false,
  
  -- Identificateur qui a enrôlé cet utilisateur
  enrolled_by_id UUID REFERENCES users_julaba(id),
  enrollment_date TIMESTAMP WITH TIME ZONE,
  
  -- Métadonnées
  metadata JSONB DEFAULT '{}',
  
  -- Dates système
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_login_at TIMESTAMP WITH TIME ZONE,
  deleted_at TIMESTAMP WITH TIME ZONE
);

-- ───────────────────────────────────────────────────────────────────
-- INDEX POUR PERFORMANCE
-- ───────────────────────────────────────────────────────────────────

CREATE INDEX idx_users_phone ON users_julaba(phone);
CREATE INDEX idx_users_role ON users_julaba(role);
CREATE INDEX idx_users_region ON users_julaba(region);
CREATE INDEX idx_users_validated ON users_julaba(validated);
CREATE INDEX idx_users_auth_user_id ON users_julaba(auth_user_id);
CREATE INDEX idx_users_enrolled_by ON users_julaba(enrolled_by_id);
CREATE INDEX idx_users_created_at ON users_julaba(created_at);

-- ───────────────────────────────────────────────────────────────────
-- TRIGGER : Mise à jour automatique de updated_at
-- ───────────────────────────────────────────────────────────────────

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

-- ───────────────────────────────────────────────────────────────────
-- ROW LEVEL SECURITY (RLS)
-- ───────────────────────────────────────────────────────────────────

-- Activer RLS
ALTER TABLE users_julaba ENABLE ROW LEVEL SECURITY;

-- Policy 1 : Les utilisateurs peuvent voir leur propre profil
CREATE POLICY "Users can view own profile"
  ON users_julaba
  FOR SELECT
  USING (auth.uid() = auth_user_id);

-- Policy 2 : Les utilisateurs peuvent mettre à jour leur propre profil
CREATE POLICY "Users can update own profile"
  ON users_julaba
  FOR UPDATE
  USING (auth.uid() = auth_user_id);

-- Policy 3 : Les institutions peuvent voir tous les utilisateurs validés
CREATE POLICY "Institutions can view all validated users"
  ON users_julaba
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users_julaba 
      WHERE auth_user_id = auth.uid() 
      AND role = 'institution'
    )
    AND validated = true
  );

-- Policy 4 : Les identificateurs peuvent voir les utilisateurs de leur zone
CREATE POLICY "Identificateurs can view users in their zone"
  ON users_julaba
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users_julaba u 
      WHERE u.auth_user_id = auth.uid() 
      AND u.role = 'identificateur'
      AND u.region = users_julaba.region
    )
  );

-- ───────────────────────────────────────────────────────────────────
-- DONNÉES DE TEST (5 utilisateurs mock)
-- ───────────────────────────────────────────────────────────────────

-- NOTE : Ces données seront insérées via le backend avec Supabase Auth
-- pour générer automatiquement les auth_user_id

-- UTILISATEUR 1 : Aminata Kouassi (Marchand)
-- Phone: 0701020304
-- Password: julaba2026

-- UTILISATEUR 2 : Konan Yao (Producteur)
-- Phone: 0709080706
-- Password: julaba2026

-- UTILISATEUR 3 : Marie Bamba (Coopérative)
-- Phone: 0705040302
-- Password: julaba2026

-- UTILISATEUR 4 : Jean Kouadio (Institution)
-- Phone: 0707070707
-- Password: julaba2026

-- UTILISATEUR 5 : Sophie Diarra (Identificateur)
-- Phone: 0708080808
-- Password: julaba2026

-- ═══════════════════════════════════════════════════════════════════
-- INSTRUCTIONS D'EXÉCUTION
-- ═══════════════════════════════════════════════════════════════════
--
-- ÉTAPE 1 : Aller sur https://supabase.com/dashboard
-- ÉTAPE 2 : Sélectionner votre projet Jùlaba
-- ÉTAPE 3 : Aller dans "SQL Editor"
-- ÉTAPE 4 : Créer une nouvelle requête
-- ÉTAPE 5 : Copier-coller CE FICHIER COMPLET
-- ÉTAPE 6 : Cliquer sur "Run" (Exécuter)
-- ÉTAPE 7 : Vérifier que la table apparaît dans "Table Editor"
--
-- ⚠️ IMPORTANT : Ne pas exécuter ce script plusieurs fois
-- Si la table existe déjà, supprimer d'abord avec : DROP TABLE users_julaba;
--
-- ═══════════════════════════════════════════════════════════════════
