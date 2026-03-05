-- ════════════════════════════════════════════════════════════════════════════
-- ROW LEVEL SECURITY (RLS) - POLITIQUES DE SÉCURITÉ
-- ════════════════════════════════════════════════════════════════════════════
-- 
-- Ce fichier active RLS et crée les politiques pour chaque profil utilisateur
-- 
-- ⚠️ IMPORTANT : Exécuter APRÈS 001_create_all_tables.sql
-- 
-- ════════════════════════════════════════════════════════════════════════════

-- ────────────────────────────────────────────────────────────────────────────
-- ACTIVER RLS SUR TOUTES LES TABLES
-- ────────────────────────────────────────────────────────────────────────────

ALTER TABLE commandes ENABLE ROW LEVEL SECURITY;
ALTER TABLE recoltes ENABLE ROW LEVEL SECURITY;
ALTER TABLE stocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE wallet_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE escrow_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE caisse_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE zones ENABLE ROW LEVEL SECURITY;
ALTER TABLE identifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE commissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE cooperatives ENABLE ROW LEVEL SECURITY;
ALTER TABLE cooperative_membres ENABLE ROW LEVEL SECURITY;
ALTER TABLE cooperative_tresorerie ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE ia_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE tickets_support ENABLE ROW LEVEL SECURITY;
ALTER TABLE missions ENABLE ROW LEVEL SECURITY;
ALTER TABLE academy_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE scores ENABLE ROW LEVEL SECURITY;

-- ════════════════════════════════════════════════════════════════════════════
-- POLITIQUES : COMMANDES
-- ════════════════════════════════════════════════════════════════════════════

-- Utilisateurs voient leurs propres commandes
CREATE POLICY "Users voient leurs commandes"
ON commandes FOR SELECT
USING (
  auth.uid() = (SELECT auth_user_id FROM users_julaba WHERE id = user_id)
  OR auth.uid() = (SELECT auth_user_id FROM users_julaba WHERE id = acheteur_id)
  OR auth.uid() = (SELECT auth_user_id FROM users_julaba WHERE id = vendeur_id)
);

-- Utilisateurs créent leurs commandes
CREATE POLICY "Users créent leurs commandes"
ON commandes FOR INSERT
WITH CHECK (
  auth.uid() = (SELECT auth_user_id FROM users_julaba WHERE id = user_id)
);

-- Utilisateurs modifient leurs commandes
CREATE POLICY "Users modifient leurs commandes"
ON commandes FOR UPDATE
USING (
  auth.uid() = (SELECT auth_user_id FROM users_julaba WHERE id = user_id)
);

-- Super Admin accès total
CREATE POLICY "Super Admin accès total commandes"
ON commandes FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM users_julaba 
    WHERE auth_user_id = auth.uid() AND role = 'super_admin'
  )
);

-- ════════════════════════════════════════════════════════════════════════════
-- POLITIQUES : RÉCOLTES
-- ════════════════════════════════════════════════════════════════════════════

CREATE POLICY "Producteurs voient leurs récoltes"
ON recoltes FOR SELECT
USING (
  auth.uid() = (SELECT auth_user_id FROM users_julaba WHERE id = producteur_id)
);

CREATE POLICY "Producteurs créent leurs récoltes"
ON recoltes FOR INSERT
WITH CHECK (
  auth.uid() = (SELECT auth_user_id FROM users_julaba WHERE id = producteur_id)
);

CREATE POLICY "Producteurs modifient leurs récoltes"
ON recoltes FOR UPDATE
USING (
  auth.uid() = (SELECT auth_user_id FROM users_julaba WHERE id = producteur_id)
);

CREATE POLICY "Super Admin accès total récoltes"
ON recoltes FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM users_julaba 
    WHERE auth_user_id = auth.uid() AND role = 'super_admin'
  )
);

-- ════════════════════════════════════════════════════════════════════════════
-- POLITIQUES : STOCKS
-- ════════════════════════════════════════════════════════════════════════════

CREATE POLICY "Users voient leur stock"
ON stocks FOR SELECT
USING (
  auth.uid() = (SELECT auth_user_id FROM users_julaba WHERE id = user_id)
);

CREATE POLICY "Users créent leur stock"
ON stocks FOR INSERT
WITH CHECK (
  auth.uid() = (SELECT auth_user_id FROM users_julaba WHERE id = user_id)
);

CREATE POLICY "Users modifient leur stock"
ON stocks FOR UPDATE
USING (
  auth.uid() = (SELECT auth_user_id FROM users_julaba WHERE id = user_id)
);

CREATE POLICY "Users suppriment leur stock"
ON stocks FOR DELETE
USING (
  auth.uid() = (SELECT auth_user_id FROM users_julaba WHERE id = user_id)
);

CREATE POLICY "Super Admin accès total stocks"
ON stocks FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM users_julaba 
    WHERE auth_user_id = auth.uid() AND role = 'super_admin'
  )
);

-- ════════════════════════════════════════════════════════════════════════════
-- POLITIQUES : WALLETS
-- ════════════════════════════════════════════════════════════════════════════

CREATE POLICY "Users voient leur wallet"
ON wallets FOR SELECT
USING (
  auth.uid() = (SELECT auth_user_id FROM users_julaba WHERE id = user_id)
);

CREATE POLICY "Users créent leur wallet"
ON wallets FOR INSERT
WITH CHECK (
  auth.uid() = (SELECT auth_user_id FROM users_julaba WHERE id = user_id)
);

CREATE POLICY "Users modifient leur wallet"
ON wallets FOR UPDATE
USING (
  auth.uid() = (SELECT auth_user_id FROM users_julaba WHERE id = user_id)
);

CREATE POLICY "Super Admin accès total wallets"
ON wallets FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM users_julaba 
    WHERE auth_user_id = auth.uid() AND role = 'super_admin'
  )
);

-- ════════════════════════════════════════════════════════════════════════════
-- POLITIQUES : WALLET TRANSACTIONS
-- ════════════════════════════════════════════════════════════════════════════

CREATE POLICY "Users voient leurs transactions wallet"
ON wallet_transactions FOR SELECT
USING (
  auth.uid() = (SELECT auth_user_id FROM users_julaba WHERE id = user_id)
);

CREATE POLICY "Users créent leurs transactions wallet"
ON wallet_transactions FOR INSERT
WITH CHECK (
  auth.uid() = (SELECT auth_user_id FROM users_julaba WHERE id = user_id)
);

CREATE POLICY "Super Admin accès total wallet transactions"
ON wallet_transactions FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM users_julaba 
    WHERE auth_user_id = auth.uid() AND role = 'super_admin'
  )
);

-- ════════════════════════════════════════════════════════════════════════════
-- POLITIQUES : ESCROW PAYMENTS
-- ════════════════════════════════════════════════════════════════════════════

CREATE POLICY "Users voient leurs escrow"
ON escrow_payments FOR SELECT
USING (
  auth.uid() = (SELECT auth_user_id FROM users_julaba WHERE id = acheteur_id)
  OR auth.uid() = (SELECT auth_user_id FROM users_julaba WHERE id = vendeur_id)
);

CREATE POLICY "Super Admin accès total escrow"
ON escrow_payments FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM users_julaba 
    WHERE auth_user_id = auth.uid() AND role = 'super_admin'
  )
);

-- ════════════════════════════════════════════════════════════════════════════
-- POLITIQUES : CAISSE TRANSACTIONS
-- ════════════════════════════════════════════════════════════════════════════

CREATE POLICY "Marchands voient leurs transactions caisse"
ON caisse_transactions FOR SELECT
USING (
  auth.uid() = (SELECT auth_user_id FROM users_julaba WHERE id = marchand_id)
);

CREATE POLICY "Marchands créent leurs transactions caisse"
ON caisse_transactions FOR INSERT
WITH CHECK (
  auth.uid() = (SELECT auth_user_id FROM users_julaba WHERE id = marchand_id)
);

CREATE POLICY "Super Admin accès total caisse"
ON caisse_transactions FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM users_julaba 
    WHERE auth_user_id = auth.uid() AND role = 'super_admin'
  )
);

-- ════════════════════════════════════════════════════════════════════════════
-- POLITIQUES : ZONES
-- ════════════════════════════════════════════════════════════════════════════

-- Tout le monde peut voir les zones
CREATE POLICY "Tous voient les zones"
ON zones FOR SELECT
USING (true);

-- Seuls les admins peuvent créer/modifier les zones
CREATE POLICY "Admins gèrent les zones"
ON zones FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM users_julaba 
    WHERE auth_user_id = auth.uid() 
    AND role IN ('super_admin', 'admin_national', 'gestionnaire_zone')
  )
);

-- ════════════════════════════════════════════════════════════════════════════
-- POLITIQUES : IDENTIFICATIONS
-- ════════════════════════════════════════════════════════════════════════════

CREATE POLICY "Identificateurs voient leurs identifications"
ON identifications FOR SELECT
USING (
  auth.uid() = (SELECT auth_user_id FROM users_julaba WHERE id = identificateur_id)
  OR auth.uid() = (SELECT auth_user_id FROM users_julaba WHERE id = acteur_id)
);

CREATE POLICY "Identificateurs créent leurs identifications"
ON identifications FOR INSERT
WITH CHECK (
  auth.uid() = (SELECT auth_user_id FROM users_julaba WHERE id = identificateur_id)
);

CREATE POLICY "Identificateurs modifient leurs identifications"
ON identifications FOR UPDATE
USING (
  auth.uid() = (SELECT auth_user_id FROM users_julaba WHERE id = identificateur_id)
);

CREATE POLICY "Super Admin accès total identifications"
ON identifications FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM users_julaba 
    WHERE auth_user_id = auth.uid() AND role = 'super_admin'
  )
);

-- ════════════════════════════════════════════════════════════════════════════
-- POLITIQUES : COMMISSIONS
-- ════════════════════════════════════════════════════════════════════════════

CREATE POLICY "Identificateurs voient leurs commissions"
ON commissions FOR SELECT
USING (
  auth.uid() = (SELECT auth_user_id FROM users_julaba WHERE id = identificateur_id)
);

CREATE POLICY "Identificateurs créent leurs commissions"
ON commissions FOR INSERT
WITH CHECK (
  auth.uid() = (SELECT auth_user_id FROM users_julaba WHERE id = identificateur_id)
);

CREATE POLICY "Super Admin accès total commissions"
ON commissions FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM users_julaba 
    WHERE auth_user_id = auth.uid() 
    AND role IN ('super_admin', 'admin_national')
  )
);

-- ════════════════════════════════════════════════════════════════════════════
-- POLITIQUES : COOPERATIVES
-- ════════════════════════════════════════════════════════════════════════════

CREATE POLICY "Cooperatives voient leur profil"
ON cooperatives FOR SELECT
USING (
  auth.uid() = (SELECT auth_user_id FROM users_julaba WHERE id = user_id)
  OR auth.uid() = (SELECT auth_user_id FROM users_julaba WHERE id = president_id)
  OR auth.uid() = (SELECT auth_user_id FROM users_julaba WHERE id = tresorier_id)
  OR auth.uid() = (SELECT auth_user_id FROM users_julaba WHERE id = secretaire_id)
);

CREATE POLICY "Cooperatives créent leur profil"
ON cooperatives FOR INSERT
WITH CHECK (
  auth.uid() = (SELECT auth_user_id FROM users_julaba WHERE id = user_id)
);

CREATE POLICY "Cooperatives modifient leur profil"
ON cooperatives FOR UPDATE
USING (
  auth.uid() = (SELECT auth_user_id FROM users_julaba WHERE id = user_id)
  OR auth.uid() = (SELECT auth_user_id FROM users_julaba WHERE id = president_id)
);

CREATE POLICY "Super Admin accès total cooperatives"
ON cooperatives FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM users_julaba 
    WHERE auth_user_id = auth.uid() AND role = 'super_admin'
  )
);

-- ════════════════════════════════════════════════════════════════════════════
-- POLITIQUES : COOPERATIVE MEMBRES
-- ════════════════════════════════════════════════════════════════════════════

CREATE POLICY "Membres voient leur cooperative"
ON cooperative_membres FOR SELECT
USING (
  auth.uid() = (SELECT auth_user_id FROM users_julaba WHERE id = membre_id)
  OR cooperative_id IN (
    SELECT id FROM cooperatives WHERE user_id IN (
      SELECT id FROM users_julaba WHERE auth_user_id = auth.uid()
    )
  )
);

CREATE POLICY "Cooperatives gèrent leurs membres"
ON cooperative_membres FOR ALL
USING (
  cooperative_id IN (
    SELECT id FROM cooperatives WHERE 
    user_id IN (SELECT id FROM users_julaba WHERE auth_user_id = auth.uid())
    OR president_id IN (SELECT id FROM users_julaba WHERE auth_user_id = auth.uid())
  )
);

CREATE POLICY "Super Admin accès total membres coop"
ON cooperative_membres FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM users_julaba 
    WHERE auth_user_id = auth.uid() AND role = 'super_admin'
  )
);

-- ════════════════════════════════════════════════════════════════════════════
-- POLITIQUES : COOPERATIVE TRESORERIE
-- ════════════════════════════════════════════════════════════════════════════

CREATE POLICY "Membres voient la trésorerie de leur coop"
ON cooperative_tresorerie FOR SELECT
USING (
  cooperative_id IN (
    SELECT cooperative_id FROM cooperative_membres 
    WHERE membre_id IN (
      SELECT id FROM users_julaba WHERE auth_user_id = auth.uid()
    )
  )
);

CREATE POLICY "Trésoriers gèrent la trésorerie"
ON cooperative_tresorerie FOR ALL
USING (
  cooperative_id IN (
    SELECT id FROM cooperatives WHERE 
    tresorier_id IN (SELECT id FROM users_julaba WHERE auth_user_id = auth.uid())
    OR president_id IN (SELECT id FROM users_julaba WHERE auth_user_id = auth.uid())
  )
);

CREATE POLICY "Super Admin accès total trésorerie"
ON cooperative_tresorerie FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM users_julaba 
    WHERE auth_user_id = auth.uid() AND role = 'super_admin'
  )
);

-- ════════════════════════════════════════════════════════════════════════════
-- POLITIQUES : NOTIFICATIONS
-- ════════════════════════════════════════════════════════════════════════════

CREATE POLICY "Users voient leurs notifications"
ON notifications FOR SELECT
USING (
  auth.uid() = (SELECT auth_user_id FROM users_julaba WHERE id = user_id)
);

CREATE POLICY "Users modifient leurs notifications"
ON notifications FOR UPDATE
USING (
  auth.uid() = (SELECT auth_user_id FROM users_julaba WHERE id = user_id)
);

CREATE POLICY "Users suppriment leurs notifications"
ON notifications FOR DELETE
USING (
  auth.uid() = (SELECT auth_user_id FROM users_julaba WHERE id = user_id)
);

CREATE POLICY "System crée les notifications"
ON notifications FOR INSERT
WITH CHECK (true);

-- ════════════════════════════════════════════════════════════════════════════
-- POLITIQUES : AUDIT LOGS
-- ════════════════════════════════════════════════════════════════════════════

-- Seuls les admins voient les audit logs
CREATE POLICY "Admins voient les audit logs"
ON audit_logs FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM users_julaba 
    WHERE auth_user_id = auth.uid() 
    AND role IN ('super_admin', 'admin_national', 'gestionnaire_zone', 'analyste')
  )
);

-- Tous peuvent créer des audit logs
CREATE POLICY "Tous créent des audit logs"
ON audit_logs FOR INSERT
WITH CHECK (true);

-- ════════════════════════════════════════════════════════════════════════════
-- POLITIQUES : IA LOGS
-- ════════════════════════════════════════════════════════════════════════════

CREATE POLICY "Users voient leurs IA logs"
ON ia_logs FOR SELECT
USING (
  auth.uid() = (SELECT auth_user_id FROM users_julaba WHERE id = user_id)
);

CREATE POLICY "Users créent leurs IA logs"
ON ia_logs FOR INSERT
WITH CHECK (
  auth.uid() = (SELECT auth_user_id FROM users_julaba WHERE id = user_id)
);

CREATE POLICY "Admins voient tous les IA logs"
ON ia_logs FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM users_julaba 
    WHERE auth_user_id = auth.uid() 
    AND role IN ('super_admin', 'admin_national')
  )
);

-- ════════════════════════════════════════════════════════════════════════════
-- POLITIQUES : TICKETS SUPPORT
-- ════════════════════════════════════════════════════════════════════════════

CREATE POLICY "Users voient leurs tickets"
ON tickets_support FOR SELECT
USING (
  auth.uid() = (SELECT auth_user_id FROM users_julaba WHERE id = user_id)
  OR auth.uid() = (SELECT auth_user_id FROM users_julaba WHERE id = assigne_a)
);

CREATE POLICY "Users créent leurs tickets"
ON tickets_support FOR INSERT
WITH CHECK (
  auth.uid() = (SELECT auth_user_id FROM users_julaba WHERE id = user_id)
);

CREATE POLICY "Users modifient leurs tickets"
ON tickets_support FOR UPDATE
USING (
  auth.uid() = (SELECT auth_user_id FROM users_julaba WHERE id = user_id)
  OR auth.uid() = (SELECT auth_user_id FROM users_julaba WHERE id = assigne_a)
);

CREATE POLICY "Admins voient tous les tickets"
ON tickets_support FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM users_julaba 
    WHERE auth_user_id = auth.uid() 
    AND role IN ('super_admin', 'admin_national')
  )
);

-- ════════════════════════════════════════════════════════════════════════════
-- POLITIQUES : MISSIONS
-- ════════════════════════════════════════════════════════════════════════════

CREATE POLICY "Identificateurs voient leurs missions"
ON missions FOR SELECT
USING (
  auth.uid() = (SELECT auth_user_id FROM users_julaba WHERE id = identificateur_id)
);

CREATE POLICY "Identificateurs modifient leurs missions"
ON missions FOR UPDATE
USING (
  auth.uid() = (SELECT auth_user_id FROM users_julaba WHERE id = identificateur_id)
);

CREATE POLICY "Admins gèrent les missions"
ON missions FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM users_julaba 
    WHERE auth_user_id = auth.uid() 
    AND role IN ('super_admin', 'admin_national', 'gestionnaire_zone')
  )
);

-- ════════════════════════════════════════════════════════════════════════════
-- POLITIQUES : ACADEMY PROGRESS
-- ════════════════════════════════════════════════════════════════════════════

CREATE POLICY "Users voient leur progression academy"
ON academy_progress FOR SELECT
USING (
  auth.uid() = (SELECT auth_user_id FROM users_julaba WHERE id = user_id)
);

CREATE POLICY "Users modifient leur progression academy"
ON academy_progress FOR ALL
USING (
  auth.uid() = (SELECT auth_user_id FROM users_julaba WHERE id = user_id)
);

CREATE POLICY "Admins voient toute la progression academy"
ON academy_progress FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM users_julaba 
    WHERE auth_user_id = auth.uid() 
    AND role IN ('super_admin', 'admin_national')
  )
);

-- ════════════════════════════════════════════════════════════════════════════
-- POLITIQUES : SCORES
-- ════════════════════════════════════════════════════════════════════════════

-- Tout le monde peut voir les scores (publics)
CREATE POLICY "Tous voient les scores"
ON scores FOR SELECT
USING (true);

-- Seuls les utilisateurs peuvent modifier leur propre score
CREATE POLICY "Users modifient leur score"
ON scores FOR UPDATE
USING (
  auth.uid() = (SELECT auth_user_id FROM users_julaba WHERE id = user_id)
);

-- Users créent leur score
CREATE POLICY "Users créent leur score"
ON scores FOR INSERT
WITH CHECK (
  auth.uid() = (SELECT auth_user_id FROM users_julaba WHERE id = user_id)
);

-- Admins peuvent tout gérer
CREATE POLICY "Admins gèrent tous les scores"
ON scores FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM users_julaba 
    WHERE auth_user_id = auth.uid() 
    AND role IN ('super_admin', 'admin_national')
  )
);

-- ════════════════════════════════════════════════════════════════════════════
-- FIN DES POLITIQUES RLS
-- ════════════════════════════════════════════════════════════════════════════

SELECT 'RLS activé avec succès sur toutes les tables!' AS message;
