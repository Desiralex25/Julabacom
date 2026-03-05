# 🔥 FIX IMMÉDIAT - Contrainte de Rôle

## 🎯 Le Problème

```
new row for relation "users_julaba" violates check constraint "users_julaba_role_check"
```

La table n'autorise que 6 rôles, mais le Back-Office a besoin de 4 rôles supplémentaires.

---

## ✅ La Solution (2 minutes)

### **1. Copier ce SQL :**

```sql
ALTER TABLE users_julaba DROP CONSTRAINT IF EXISTS users_julaba_role_check;

ALTER TABLE users_julaba ADD CONSTRAINT users_julaba_role_check 
CHECK (role IN ('marchand', 'producteur', 'cooperative', 'institution', 'identificateur', 'consommateur', 'super_admin', 'admin_national', 'gestionnaire_zone', 'analyste'));
```

### **2. Coller dans Supabase :**

1. https://supabase.com/dashboard
2. Projet JÙLABA > SQL Editor
3. Coller le SQL ci-dessus
4. Cliquer "Run"

### **3. Créer le Super Admin :**

1. https://julabacom.vercel.app/create-super-admin
2. Remplir le formulaire
3. Créer le compte
4. ✅ **Succès !**

---

## 📁 Fichiers Créés

- ✅ **COPIER_COLLER_ICI.sql** → Script SQL prêt à l'emploi
- ✅ **SOLUTION_FINALE_COPIER_COLLER.md** → Guide complet
- ✅ **MIGRATION_ADD_BACKOFFICE_ROLES.sql** → Migration documentée
- ✅ **users-schema-UPDATED.sql** → Nouveau schéma complet

---

## 🚀 TL;DR

```bash
1. Copier le SQL ci-dessus
2. Exécuter dans Supabase
3. Créer le Super Admin
4. 🎉 C'est bon !
```

---

**Fichier le plus simple :** `COPIER_COLLER_ICI.sql` ⬅️ Utilise celui-ci !
