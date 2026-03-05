# 🚀 GUIDE DE DÉPLOIEMENT VERCEL — JÙLABA

**Date** : 5 mars 2026  
**Statut** : Production-ready à 88%

---

## 🎯 ACCÈS AU BACK-OFFICE EN PRODUCTION

### **URL du Back-Office**
```
https://votre-app.vercel.app/backoffice
```

### **Comptes par défaut (NON SÉCURISÉS)**

⚠️ **ATTENTION** : Si vous n'avez pas configuré les variables d'environnement, les mots de passe par défaut sont :

| Rôle | Email | Mot de passe par défaut |
|------|-------|-------------------------|
| Super Admin | `superadmin@julaba.ci` | `admin123` |
| Admin National | `admin.national@julaba.ci` | `admin123` |
| Gestionnaire de Zone | `gestionnaire.abidjan@julaba.ci` | `admin123` |
| Analyste | `analyste@julaba.ci` | `admin123` |

**⚠️ CHANGEZ CES MOTS DE PASSE IMMÉDIATEMENT APRÈS LE PREMIER DÉPLOIEMENT !**

---

## 🔐 SÉCURISATION DES MOTS DE PASSE BACK-OFFICE

### **1. Configuration locale (.env)**

1. Créez un fichier `.env` à la racine du projet (NE PAS commiter) :

```bash
# Copiez .env.example
cp .env.example .env
```

2. Éditez `.env` et changez tous les mots de passe :

```env
VITE_BO_SUPERADMIN_PASSWORD=VotreMotDePasseTrèsSecurisé2026!
VITE_BO_ADMIN_PASSWORD=UnAutreMotDePasseComplexe2026!
VITE_BO_GESTIONNAIRE_PASSWORD=EncoreUnMotDePasseFort2026!
VITE_BO_ANALYSTE_PASSWORD=DernierMotDePasseSécurisé2026!
```

3. Testez en local :

```bash
npm run dev
```

4. Connectez-vous avec vos nouveaux mots de passe

---

### **2. Configuration Vercel (Production)**

#### **Option A : Via l'interface Vercel (recommandé)**

1. Allez sur votre projet Vercel : https://vercel.com/dashboard
2. Cliquez sur votre projet **Jùlaba**
3. Allez dans **Settings** > **Environment Variables**
4. Ajoutez ces 4 variables :

| Variable | Value | Environment |
|----------|-------|-------------|
| `VITE_BO_SUPERADMIN_PASSWORD` | Votre mot de passe sécurisé | Production, Preview, Development |
| `VITE_BO_ADMIN_PASSWORD` | Votre mot de passe sécurisé | Production, Preview, Development |
| `VITE_BO_GESTIONNAIRE_PASSWORD` | Votre mot de passe sécurisé | Production, Preview, Development |
| `VITE_BO_ANALYSTE_PASSWORD` | Votre mot de passe sécurisé | Production, Preview, Development |

5. Cliquez sur **Save**
6. **Redéployez** l'application pour que les nouvelles variables prennent effet

#### **Option B : Via Vercel CLI**

```bash
# Installer Vercel CLI si nécessaire
npm i -g vercel

# Se connecter
vercel login

# Ajouter les variables
vercel env add VITE_BO_SUPERADMIN_PASSWORD
# Entrez votre mot de passe sécurisé
# Sélectionnez : Production, Preview, Development

vercel env add VITE_BO_ADMIN_PASSWORD
vercel env add VITE_BO_GESTIONNAIRE_PASSWORD
vercel env add VITE_BO_ANALYSTE_PASSWORD

# Redéployer
vercel --prod
```

---

## 📋 CHECKLIST DE SÉCURITÉ AVANT PRODUCTION

- [ ] Variables d'environnement configurées sur Vercel
- [ ] Mots de passe par défaut (`admin123`) changés
- [ ] `.env` ajouté dans `.gitignore`
- [ ] Testé la connexion avec les nouveaux mots de passe
- [ ] Documenté les mots de passe dans un gestionnaire sécurisé (1Password, Bitwarden, etc.)

---

## 🎯 CRÉER DES COMPTES UTILISATEURS

Une fois connecté au Back-Office avec le compte Super Admin :

### **Étape 1 : Accéder au module Enrôlement**
1. Connectez-vous : `https://votre-app.vercel.app/backoffice`
2. Dans le menu latéral, cliquez sur **"Enrôlement"**
3. Cliquez sur l'onglet **"Créer un compte"**

### **Étape 2 : Remplir le formulaire**
- **Nom** et **Prénom**
- **Téléphone** (format : 0701234567)
- **Rôle** : Marchand, Producteur, Coopérative, Identificateur, Institution
- **Zone/Marché** : Zone d'activité
- **Email** (optionnel)

### **Étape 3 : Valider**
- Le compte est créé immédiatement
- L'utilisateur peut se connecter avec son numéro de téléphone

---

## ⚠️ LIMITATIONS ACTUELLES (SANS SUPABASE)

### **Données volatiles**
- ❌ Les comptes créés sont stockés en mémoire (perdu au refresh)
- ❌ Pas de persistance des données
- ❌ Pas de synchronisation multi-utilisateurs

### **Solution : Migration Supabase**
Pour une vraie production, vous **devez** migrer vers Supabase :
1. Créer un projet Supabase
2. Configurer les tables (users, commandes, recoltes, etc.)
3. Activer Supabase Auth avec OTP SMS
4. Remplacer les TODOs dans le code

📖 **Documentation** : Voir `/RAPPORT_AUDIT_PRODUCTION_CLEANLINESS.md`

---

## 🚨 DÉPANNAGE

### **Problème : "Identifiants incorrects"**
**Cause** : Les variables d'environnement ne sont pas configurées  
**Solution** : Vérifiez les variables dans Vercel Settings et redéployez

### **Problème : Compte créé mais perdu après refresh**
**Cause** : Pas de backend Supabase  
**Solution** : C'est normal sans Supabase. Utilisez les comptes BO pour les tests

### **Problème : Impossible d'accéder à `/backoffice`**
**Cause** : Route non configurée  
**Solution** : Vérifiez que `/src/app/routes.tsx` contient bien la route `/backoffice`

---

## 📞 SUPPORT

Pour toute question sur le déploiement :
1. Vérifiez les logs Vercel
2. Consultez la documentation : `/DOCUMENTATION_TECHNIQUE_JULABA.md`
3. Vérifiez le rapport d'audit : `/RAPPORT_AUDIT_PRODUCTION_CLEANLINESS.md`

---

## 🎉 PROCHAINES ÉTAPES

Une fois connecté au BO et après avoir créé vos premiers comptes :

1. **Tester tous les modules** du Back-Office (Dashboard, Acteurs, Enrôlement, etc.)
2. **Créer des comptes test** pour chaque rôle (Marchand, Producteur, Coopérative)
3. **Planifier la migration Supabase** pour la persistance des données
4. **Configurer les services externes** (ElevenLabs pour Tantie Sagesse, SMS API)

---

**Déployé avec ❤️ par l'équipe Jùlaba**
