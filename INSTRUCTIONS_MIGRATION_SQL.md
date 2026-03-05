# 📋 INSTRUCTIONS POUR EXÉCUTER LES MIGRATIONS SQL

## ⚠️ IMPORTANT : À FAIRE MANUELLEMENT DANS SUPABASE

Les fichiers SQL de migration ont été créés mais **DOIVENT ÊTRE EXÉCUTÉS MANUELLEMENT** dans Supabase SQL Editor.

---

## 🔧 ÉTAPES D'EXÉCUTION

### **1. Se connecter à Supabase Dashboard**

```
https://supabase.com/dashboard
```

1. Sélectionner ton projet Jùlaba
2. Aller dans **SQL Editor** (menu de gauche)

---

### **2. Exécuter la Migration 001 - Création des Tables**

1. Dans SQL Editor, cliquer sur **"New query"**
2. Copier TOUT le contenu du fichier :
   ```
   /supabase/migrations/001_create_all_tables.sql
   ```
3. Coller dans l'éditeur SQL
4. Cliquer sur **"Run"** (ou Ctrl+Enter)
5. ✅ Vérifier le message : `Migration complete: 20 tables créées avec succès!`

---

### **3. Exécuter la Migration 002 - Activation RLS**

1. Créer une **nouvelle query**
2. Copier TOUT le contenu du fichier :
   ```
   /supabase/migrations/002_enable_rls_policies.sql
   ```
3. Coller dans l'éditeur SQL
4. Cliquer sur **"Run"**
5. ✅ Vérifier le message : `RLS activé avec succès sur toutes les tables!`

---

## ✅ VÉRIFICATIONS POST-MIGRATION

### **1. Vérifier que les tables existent**

Dans SQL Editor, exécuter :

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_type = 'BASE TABLE'
ORDER BY table_name;
```

**Tu devrais voir 20+ tables :**
- academy_progress
- audit_logs
- caisse_transactions
- commandes
- commissions
- cooperative_membres
- cooperative_tresorerie
- cooperatives
- escrow_payments
- ia_logs
- identifications
- missions
- notifications
- recoltes
- scores
- stocks
- tickets_support
- users_julaba (existante)
- wallet_transactions
- wallets
- zones

---

### **2. Vérifier que RLS est activé**

```sql
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY tablename;
```

**Toutes les tables doivent avoir `rowsecurity = true`**

---

### **3. Vérifier les politiques RLS**

```sql
SELECT schemaname, tablename, policyname 
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
```

**Tu devrais voir ~60+ politiques RLS**

---

## 📊 TABLES CRÉÉES

| # | Table | Description | Lignes Estimées |
|---|-------|-------------|-----------------|
| 1 | commandes | Commandes achat/vente | ~27 |
| 2 | recoltes | Récoltes producteurs | ~26 |
| 3 | stocks | Stocks marchands/producteurs | ~23 |
| 4 | wallets | Portefeuilles utilisateurs | ~17 |
| 5 | wallet_transactions | Transactions wallet | ~23 |
| 6 | escrow_payments | Paiements sécurisés | ~21 |
| 7 | caisse_transactions | Transactions caisse | ~19 |
| 8 | zones | Zones géographiques | ~18 |
| 9 | identifications | Identifications acteurs | ~24 |
| 10 | commissions | Commissions identificateurs | ~16 |
| 11 | cooperatives | Coopératives | ~18 |
| 12 | cooperative_membres | Membres coopératives | ~20 |
| 13 | cooperative_tresorerie | Trésorerie coopératives | ~17 |
| 14 | notifications | Notifications utilisateurs | ~21 |
| 15 | audit_logs | Logs d'audit | ~19 |
| 16 | ia_logs | Logs IA Tantie Sagesse | ~17 |
| 17 | tickets_support | Tickets support | ~21 |
| 18 | missions | Missions identificateurs | ~22 |
| 19 | academy_progress | Progression academy | ~18 |
| 20 | scores | Scores utilisateurs | ~19 |

**TOTAL : 20 tables + ~375 lignes de SQL**

---

## 🔐 POLITIQUES RLS CRÉÉES

### **Par Profil**

| Profil | Tables Accessibles | Politiques |
|--------|-------------------|------------|
| **Marchand** | commandes, stocks, caisse_transactions, wallet, notifications | 15+ |
| **Producteur** | recoltes, commandes, stocks, wallet, notifications | 12+ |
| **Identificateur** | identifications, commissions, missions, notifications | 10+ |
| **Coopérative** | cooperatives, cooperative_membres, cooperative_tresorerie, notifications | 12+ |
| **Institution** | (à définir selon besoins) | - |
| **BackOffice** | TOUTES les tables (accès global) | 20+ |

---

## 🚨 ERREURS POSSIBLES

### **Erreur : "relation already exists"**

**Cause :** La table existe déjà

**Solution :** 
1. Vérifier si la table existe :
   ```sql
   SELECT * FROM information_schema.tables WHERE table_name = 'NOM_TABLE';
   ```
2. Si oui, supprimer :
   ```sql
   DROP TABLE IF EXISTS NOM_TABLE CASCADE;
   ```
3. Réexécuter la migration

---

### **Erreur : "constraint violates"**

**Cause :** Contrainte de clé étrangère

**Solution :** S'assurer que `users_julaba` existe déjà

---

### **Erreur : "permission denied"**

**Cause :** Pas les droits admin

**Solution :** Utiliser le **service_role** dans Supabase, pas l'`anon` key

---

## ⏭️ PROCHAINES ÉTAPES

Une fois les migrations exécutées :

1. ✅ **Routes API Backend**
   - Créer les fichiers de routes dans `/supabase/functions/server/`
   - Implémenter CRUD pour chaque entité

2. ✅ **Clients API Frontend**
   - Créer les helpers API dans `/src/imports/`
   - Un fichier par entité (ex: `commandes-api.ts`)

3. ✅ **Migration des Contexts**
   - Modifier chaque context pour utiliser Supabase
   - Supprimer les données locales
   - Implémenter loading states

4. ✅ **Tests**
   - Tester chaque profil utilisateur
   - Vérifier les permissions RLS
   - Vérifier les performances

---

## 📞 SUPPORT

Si tu rencontres des erreurs :

1. Copier le message d'erreur complet
2. Vérifier la section "Erreurs Possibles" ci-dessus
3. Si toujours bloqué, partager le message d'erreur

---

**Date de création :** Mars 2026  
**Version :** 1.0.0  
**Status :** ⚠️ EN ATTENTE D'EXÉCUTION MANUELLE
