-- ═══════════════════════════════════════════════════════════════════
-- MIGRATION : Ajout des rôles Back-Office à users_julaba
-- Date : Mars 2026
-- Description : Ajoute super_admin, admin_national, gestionnaire_zone, analyste
-- ═══════════════════════════════════════════════════════════════════

-- Étape 1 : Supprimer l'ancienne contrainte de rôle
ALTER TABLE users_julaba 
DROP CONSTRAINT IF EXISTS users_julaba_role_check;

-- Étape 2 : Créer la nouvelle contrainte avec TOUS les rôles
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

-- Étape 3 : Vérification (optionnel - pour voir le résultat)
SELECT 
  conname AS constraint_name,
  pg_get_constraintdef(oid) AS constraint_definition
FROM pg_constraint
WHERE conrelid = 'users_julaba'::regclass
  AND conname = 'users_julaba_role_check';
