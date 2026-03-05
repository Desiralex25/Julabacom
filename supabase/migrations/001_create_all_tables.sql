-- ════════════════════════════════════════════════════════════════════════════
-- MIGRATION COMPLETE JULABA - TOUTES LES TABLES
-- ════════════════════════════════════════════════════════════════════════════
-- 
-- Ce fichier crée toutes les tables nécessaires pour la migration 100% Supabase
-- 
-- ⚠️ IMPORTANT : Exécuter ce script dans Supabase SQL Editor
-- 
-- ════════════════════════════════════════════════════════════════════════════

-- ────────────────────────────────────────────────────────────────────────────
-- 1. COMMANDES
-- ────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS commandes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users_julaba(id) ON DELETE CASCADE,
  acheteur_id UUID REFERENCES users_julaba(id) ON DELETE SET NULL,
  vendeur_id UUID REFERENCES users_julaba(id) ON DELETE SET NULL,
  type TEXT CHECK (type IN ('achat', 'vente')),
  statut TEXT CHECK (statut IN ('en_attente', 'confirmee', 'en_route', 'livree', 'annulee')) DEFAULT 'en_attente',
  produit TEXT NOT NULL,
  quantite TEXT NOT NULL,
  prix DECIMAL NOT NULL,
  total DECIMAL NOT NULL,
  mode_paiement TEXT,
  date_creation TIMESTAMPTZ DEFAULT NOW(),
  date_livraison TIMESTAMPTZ,
  adresse_livraison TEXT,
  notes TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_commandes_user ON commandes(user_id);
CREATE INDEX idx_commandes_acheteur ON commandes(acheteur_id);
CREATE INDEX idx_commandes_vendeur ON commandes(vendeur_id);
CREATE INDEX idx_commandes_statut ON commandes(statut);

-- ────────────────────────────────────────────────────────────────────────────
-- 2. RÉCOLTES
-- ────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS recoltes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  producteur_id UUID REFERENCES users_julaba(id) ON DELETE CASCADE,
  produit TEXT NOT NULL,
  quantite DECIMAL NOT NULL,
  unite TEXT NOT NULL,
  qualite TEXT CHECK (qualite IN ('standard', 'premium', 'bio')) DEFAULT 'standard',
  prix_unitaire DECIMAL NOT NULL,
  statut TEXT CHECK (statut IN ('declaree', 'validee', 'vendue')) DEFAULT 'declaree',
  date_recolte DATE NOT NULL,
  parcelle TEXT,
  notes TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_recoltes_producteur ON recoltes(producteur_id);
CREATE INDEX idx_recoltes_statut ON recoltes(statut);
CREATE INDEX idx_recoltes_date ON recoltes(date_recolte);

-- ────────────────────────────────────────────────────────────────────────────
-- 3. STOCKS
-- ────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS stocks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users_julaba(id) ON DELETE CASCADE,
  produit TEXT NOT NULL,
  quantite DECIMAL NOT NULL,
  unite TEXT NOT NULL,
  prix_achat DECIMAL,
  derniere_modification TIMESTAMPTZ DEFAULT NOW(),
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, produit)
);

CREATE INDEX idx_stocks_user ON stocks(user_id);

-- ────────────────────────────────────────────────────────────────────────────
-- 4. WALLETS
-- ────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS wallets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users_julaba(id) ON DELETE CASCADE UNIQUE,
  solde DECIMAL DEFAULT 0,
  solde_bloque DECIMAL DEFAULT 0,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_wallets_user ON wallets(user_id);

-- ────────────────────────────────────────────────────────────────────────────
-- 5. WALLET TRANSACTIONS
-- ────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS wallet_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_id UUID REFERENCES wallets(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users_julaba(id) ON DELETE CASCADE,
  type TEXT CHECK (type IN ('credit', 'debit', 'blocage', 'deblocage', 'remboursement')) NOT NULL,
  montant DECIMAL NOT NULL,
  description TEXT,
  reference TEXT,
  statut TEXT CHECK (statut IN ('pending', 'completed', 'failed', 'cancelled')) DEFAULT 'completed',
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_wallet_transactions_wallet ON wallet_transactions(wallet_id);
CREATE INDEX idx_wallet_transactions_user ON wallet_transactions(user_id);
CREATE INDEX idx_wallet_transactions_type ON wallet_transactions(type);

-- ────────────────────────────────────────────────────────────────────────────
-- 6. ESCROW PAYMENTS
-- ────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS escrow_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  commande_id UUID REFERENCES commandes(id) ON DELETE CASCADE,
  acheteur_id UUID REFERENCES users_julaba(id) ON DELETE SET NULL,
  vendeur_id UUID REFERENCES users_julaba(id) ON DELETE SET NULL,
  montant DECIMAL NOT NULL,
  statut TEXT CHECK (statut IN ('bloque', 'libere', 'rembourse', 'annule')) DEFAULT 'bloque',
  date_creation TIMESTAMPTZ DEFAULT NOW(),
  date_liberation TIMESTAMPTZ,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_escrow_commande ON escrow_payments(commande_id);
CREATE INDEX idx_escrow_statut ON escrow_payments(statut);

-- ────────────────────────────────────────────────────────────────────────────
-- 7. CAISSE TRANSACTIONS
-- ────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS caisse_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  marchand_id UUID REFERENCES users_julaba(id) ON DELETE CASCADE,
  type TEXT CHECK (type IN ('vente', 'depense', 'approvisionnement')) NOT NULL,
  montant DECIMAL NOT NULL,
  produits JSONB,
  mode_paiement TEXT,
  notes TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_caisse_marchand ON caisse_transactions(marchand_id);
CREATE INDEX idx_caisse_type ON caisse_transactions(type);
CREATE INDEX idx_caisse_date ON caisse_transactions(created_at);

-- ────────────────────────────────────────────────────────────────────────────
-- 8. ZONES
-- ────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS zones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nom TEXT NOT NULL,
  type TEXT CHECK (type IN ('region', 'departement', 'commune', 'village')) NOT NULL,
  parent_id UUID REFERENCES zones(id) ON DELETE SET NULL,
  gestionnaire_id UUID REFERENCES users_julaba(id) ON DELETE SET NULL,
  actif BOOLEAN DEFAULT TRUE,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_zones_type ON zones(type);
CREATE INDEX idx_zones_parent ON zones(parent_id);
CREATE INDEX idx_zones_gestionnaire ON zones(gestionnaire_id);

-- ────────────────────────────────────────────────────────────────────────────
-- 9. IDENTIFICATIONS
-- ────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS identifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  identificateur_id UUID REFERENCES users_julaba(id) ON DELETE CASCADE,
  acteur_id UUID REFERENCES users_julaba(id) ON DELETE SET NULL,
  type_acteur TEXT CHECK (type_acteur IN ('marchand', 'producteur', 'cooperative', 'institution')),
  statut TEXT CHECK (statut IN ('en_attente', 'validee', 'rejetee')) DEFAULT 'en_attente',
  documents JSONB,
  zone_id UUID REFERENCES zones(id) ON DELETE SET NULL,
  commission DECIMAL,
  commission_payee BOOLEAN DEFAULT FALSE,
  date_identification DATE NOT NULL,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_identifications_identificateur ON identifications(identificateur_id);
CREATE INDEX idx_identifications_acteur ON identifications(acteur_id);
CREATE INDEX idx_identifications_statut ON identifications(statut);

-- ────────────────────────────────────────────────────────────────────────────
-- 10. COMMISSIONS
-- ────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS commissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  identificateur_id UUID REFERENCES users_julaba(id) ON DELETE CASCADE,
  identification_id UUID REFERENCES identifications(id) ON DELETE SET NULL,
  montant DECIMAL NOT NULL,
  statut TEXT CHECK (statut IN ('en_attente', 'validee', 'payee')) DEFAULT 'en_attente',
  periode TEXT,
  date_paiement DATE,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_commissions_identificateur ON commissions(identificateur_id);
CREATE INDEX idx_commissions_statut ON commissions(statut);

-- ────────────────────────────────────────────────────────────────────────────
-- 11. COOPERATIVES
-- ────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS cooperatives (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users_julaba(id) ON DELETE CASCADE UNIQUE,
  nom TEXT NOT NULL,
  president_id UUID REFERENCES users_julaba(id) ON DELETE SET NULL,
  tresorier_id UUID REFERENCES users_julaba(id) ON DELETE SET NULL,
  secretaire_id UUID REFERENCES users_julaba(id) ON DELETE SET NULL,
  solde_tresorerie DECIMAL DEFAULT 0,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_cooperatives_user ON cooperatives(user_id);

-- ────────────────────────────────────────────────────────────────────────────
-- 12. COOPERATIVE MEMBRES
-- ────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS cooperative_membres (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cooperative_id UUID REFERENCES cooperatives(id) ON DELETE CASCADE,
  membre_id UUID REFERENCES users_julaba(id) ON DELETE CASCADE,
  role TEXT CHECK (role IN ('president', 'tresorier', 'secretaire', 'membre')) DEFAULT 'membre',
  date_adhesion DATE NOT NULL,
  cotisation_payee BOOLEAN DEFAULT FALSE,
  actif BOOLEAN DEFAULT TRUE,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(cooperative_id, membre_id)
);

CREATE INDEX idx_coop_membres_cooperative ON cooperative_membres(cooperative_id);
CREATE INDEX idx_coop_membres_membre ON cooperative_membres(membre_id);

-- ────────────────────────────────────────────────────────────────────────────
-- 13. COOPERATIVE TRESORERIE
-- ────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS cooperative_tresorerie (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cooperative_id UUID REFERENCES cooperatives(id) ON DELETE CASCADE,
  type TEXT CHECK (type IN ('cotisation', 'vente', 'achat', 'subvention', 'depense', 'retrait')) NOT NULL,
  montant DECIMAL NOT NULL,
  membre_id UUID REFERENCES users_julaba(id) ON DELETE SET NULL,
  description TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_coop_tresorerie_cooperative ON cooperative_tresorerie(cooperative_id);
CREATE INDEX idx_coop_tresorerie_type ON cooperative_tresorerie(type);

-- ────────────────────────────────────────────────────────────────────────────
-- 14. NOTIFICATIONS
-- ────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users_julaba(id) ON DELETE CASCADE,
  role TEXT,
  type TEXT NOT NULL,
  titre TEXT NOT NULL,
  message TEXT NOT NULL,
  priority TEXT CHECK (priority IN ('low', 'medium', 'high', 'critical')) DEFAULT 'medium',
  is_read BOOLEAN DEFAULT FALSE,
  category TEXT,
  icon TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(is_read);
CREATE INDEX idx_notifications_priority ON notifications(priority);

-- ────────────────────────────────────────────────────────────────────────────
-- 15. AUDIT LOGS
-- ────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users_julaba(id) ON DELETE SET NULL,
  role TEXT,
  action TEXT NOT NULL,
  description TEXT,
  severity TEXT CHECK (severity IN ('info', 'warning', 'critical')) DEFAULT 'info',
  entity_type TEXT,
  entity_id UUID,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_audit_user ON audit_logs(user_id);
CREATE INDEX idx_audit_action ON audit_logs(action);
CREATE INDEX idx_audit_severity ON audit_logs(severity);
CREATE INDEX idx_audit_date ON audit_logs(created_at);

-- ────────────────────────────────────────────────────────────────────────────
-- 16. IA LOGS (Tantie Sagesse)
-- ────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS ia_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users_julaba(id) ON DELETE CASCADE,
  role TEXT,
  action_requested TEXT NOT NULL,
  action_executed TEXT,
  confirmation_required BOOLEAN DEFAULT FALSE,
  status TEXT CHECK (status IN ('pending', 'executed', 'cancelled', 'failed')) DEFAULT 'pending',
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_ia_logs_user ON ia_logs(user_id);
CREATE INDEX idx_ia_logs_status ON ia_logs(status);
CREATE INDEX idx_ia_logs_date ON ia_logs(created_at);

-- ────────────────────────────────────────────────────────────────────────────
-- 17. TICKETS SUPPORT
-- ────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS tickets_support (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users_julaba(id) ON DELETE CASCADE,
  titre TEXT NOT NULL,
  description TEXT NOT NULL,
  categorie TEXT CHECK (categorie IN ('technique', 'paiement', 'livraison', 'compte', 'autre')) DEFAULT 'autre',
  priorite TEXT CHECK (priorite IN ('basse', 'moyenne', 'haute', 'critique')) DEFAULT 'moyenne',
  statut TEXT CHECK (statut IN ('ouvert', 'en_cours', 'resolu', 'ferme')) DEFAULT 'ouvert',
  assigne_a UUID REFERENCES users_julaba(id) ON DELETE SET NULL,
  reponses JSONB,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_tickets_user ON tickets_support(user_id);
CREATE INDEX idx_tickets_statut ON tickets_support(statut);
CREATE INDEX idx_tickets_priorite ON tickets_support(priorite);

-- ────────────────────────────────────────────────────────────────────────────
-- 18. MISSIONS
-- ────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS missions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  identificateur_id UUID REFERENCES users_julaba(id) ON DELETE CASCADE,
  titre TEXT NOT NULL,
  description TEXT,
  zone_id UUID REFERENCES zones(id) ON DELETE SET NULL,
  objectif INTEGER,
  progres INTEGER DEFAULT 0,
  statut TEXT CHECK (statut IN ('en_cours', 'terminee', 'annulee')) DEFAULT 'en_cours',
  date_debut DATE,
  date_fin DATE,
  recompense DECIMAL,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_missions_identificateur ON missions(identificateur_id);
CREATE INDEX idx_missions_statut ON missions(statut);

-- ────────────────────────────────────────────────────────────────────────────
-- 19. ACADEMY PROGRESS
-- ────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS academy_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users_julaba(id) ON DELETE CASCADE,
  module_id TEXT NOT NULL,
  progres INTEGER DEFAULT 0,
  complete BOOLEAN DEFAULT FALSE,
  score INTEGER,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, module_id)
);

CREATE INDEX idx_academy_user ON academy_progress(user_id);
CREATE INDEX idx_academy_module ON academy_progress(module_id);

-- ────────────────────────────────────────────────────────────────────────────
-- 20. SCORES
-- ────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users_julaba(id) ON DELETE CASCADE UNIQUE,
  score_total INTEGER DEFAULT 0,
  score_fiabilite INTEGER DEFAULT 0,
  score_qualite INTEGER DEFAULT 0,
  score_ponctualite INTEGER DEFAULT 0,
  nb_transactions INTEGER DEFAULT 0,
  nb_avis INTEGER DEFAULT 0,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_scores_user ON scores(user_id);
CREATE INDEX idx_scores_total ON scores(score_total);

-- ════════════════════════════════════════════════════════════════════════════
-- TRIGGERS POUR updated_at
-- ════════════════════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_commandes_updated_at BEFORE UPDATE ON commandes
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_recoltes_updated_at BEFORE UPDATE ON recoltes
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_stocks_updated_at BEFORE UPDATE ON stocks
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_wallets_updated_at BEFORE UPDATE ON wallets
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_escrow_updated_at BEFORE UPDATE ON escrow_payments
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_zones_updated_at BEFORE UPDATE ON zones
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_identifications_updated_at BEFORE UPDATE ON identifications
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cooperatives_updated_at BEFORE UPDATE ON cooperatives
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_coop_membres_updated_at BEFORE UPDATE ON cooperative_membres
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tickets_updated_at BEFORE UPDATE ON tickets_support
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_missions_updated_at BEFORE UPDATE ON missions
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_academy_updated_at BEFORE UPDATE ON academy_progress
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_scores_updated_at BEFORE UPDATE ON scores
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ════════════════════════════════════════════════════════════════════════════
-- FIN DE LA MIGRATION
-- ════════════════════════════════════════════════════════════════════════════

SELECT 'Migration complete: 20 tables créées avec succès!' AS message;
