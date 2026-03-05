-- ═══════════════════════════════════════════════════════════════════
-- 🎯 JÙLABA - MIGRATION BACK-OFFICE
-- ═══════════════════════════════════════════════════════════════════
-- 📝 Description : Ajoute les rôles Back-Office (super_admin, etc.)
-- 📅 Date : Mars 2026
-- ⚡ Action : Copier-coller ce script dans Supabase SQL Editor
-- ═══════════════════════════════════════════════════════════════════

-- ÉTAPE 1 : Supprimer l'ancienne contrainte
ALTER TABLE users_julaba 
DROP CONSTRAINT IF EXISTS users_julaba_role_check;

-- ÉTAPE 2 : Créer la nouvelle contrainte avec TOUS les rôles
ALTER TABLE users_julaba 
ADD CONSTRAINT users_julaba_role_check 
CHECK (role IN (
  -- Rôles acteurs terrain (6 profils)
  'marchand', 
  'producteur', 
  'cooperative', 
  'institution', 
  'identificateur', 
  'consommateur',
  
  -- Rôles administratifs Back-Office (4 rôles RBAC)
  'super_admin',
  'admin_national',
  'gestionnaire_zone',
  'analyste'
));

-- ═══════════════════════════════════════════════════════════════════
-- ✅ C'EST TOUT ! Maintenant tu peux créer le Super Admin.
-- ═══════════════════════════════════════════════════════════════════
