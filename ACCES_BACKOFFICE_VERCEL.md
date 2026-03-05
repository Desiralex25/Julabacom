# 🚀 ACCÈS RAPIDE AU BACK-OFFICE SUR VERCEL

**Date** : 5 mars 2026  
**Urgence** : Guide express pour accéder au BO déployé

---

## ✅ **SOLUTION IMMÉDIATE (5 SECONDES)**

### **1. URL d'accès**
```
https://votre-app.vercel.app/backoffice
```
*(Remplacez `votre-app.vercel.app` par votre vraie URL Vercel)*

### **2. Connexion Super Admin**
- **Email** : `superadmin@julaba.ci`
- **Mot de passe** : `admin123`

### **3. Créer des comptes**
1. Une fois connecté, allez dans **"Enrôlement"** (menu latéral)
2. Cliquez sur l'onglet **"Créer un compte"**
3. Remplissez le formulaire et validez

---

## 🔐 **SÉCURISATION (AVANT PRODUCTION RÉELLE)**

### **ÉTAPE 1 : Configurer les variables Vercel**

1. Allez sur https://vercel.com/dashboard
2. Cliquez sur votre projet **Jùlaba**
3. **Settings** > **Environment Variables**
4. Ajoutez ces 4 variables :

```
VITE_BO_SUPERADMIN_PASSWORD = VotreMotDePasseSecurise123!
VITE_BO_ADMIN_PASSWORD = VotreMotDePasseSecurise456!
VITE_BO_GESTIONNAIRE_PASSWORD = VotreMotDePasseSecurise789!
VITE_BO_ANALYSTE_PASSWORD = VotreMotDePasseSecurise012!
```

5. Cliquez sur **Save**

### **ÉTAPE 2 : Redéployer**

Option A (automatique) : Push sur Git
```bash
git add .
git commit -m "Sécurisation mots de passe BO"
git push
```

Option B (manuel) : Vercel Dashboard > Deployments > Redeploy

### **ÉTAPE 3 : Tester**

Connectez-vous avec votre nouveau mot de passe sécurisé

---

## 📋 **TOUS LES COMPTES DISPONIBLES**

| Rôle | Email | Permissions |
|------|-------|-------------|
| **Super Admin** | `superadmin@julaba.ci` | Accès complet (recommandé) |
| Admin National | `admin.national@julaba.ci` | Gestion nationale |
| Gestionnaire de Zone | `gestionnaire.abidjan@julaba.ci` | Gestion régionale |
| Analyste | `analyste@julaba.ci` | Lecture seule |

**Mot de passe par défaut** : `admin123` (si variables non configurées)

---

## ⚠️ **LIMITATIONS ACTUELLES**

Sans Supabase connecté :
- ❌ Les comptes créés sont perdus au refresh
- ❌ Pas de persistance des données
- ❌ Utiliser uniquement pour les tests

**Solution** : Migrer vers Supabase pour la production réelle

---

## 🎯 **LIENS UTILES**

- **Guide complet** : `/VERCEL_DEPLOYMENT_GUIDE.md`
- **Rapport d'audit** : `/RAPPORT_AUDIT_PRODUCTION_CLEANLINESS.md`
- **Documentation technique** : `/DOCUMENTATION_TECHNIQUE_JULABA.md`

---

## 🆘 **BESOIN D'AIDE ?**

**Problème : "Identifiants incorrects"**  
→ Vérifiez que vous utilisez bien `admin123` ou vos variables Vercel

**Problème : Compte créé mais perdu après refresh**  
→ Normal sans Supabase. Les données sont en mémoire uniquement

**Problème : Impossible d'accéder au BO**  
→ Vérifiez l'URL : doit finir par `/backoffice`

---

**Bonne utilisation du Back-Office Jùlaba !** 🎉
