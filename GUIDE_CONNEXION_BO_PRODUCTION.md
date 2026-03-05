# 🔐 CONNEXION AU BACK-OFFICE JÙLABA (PRODUCTION)

**URL de l'application** : https://julabacom.vercel.app/

---

## 🚀 ACCÈS DIRECT EN PRODUCTION

### **Étape 1 : Ouvrir la page de connexion**

Allez directement sur :
```
https://julabacom.vercel.app/backoffice/login
```

### **Étape 2 : Choisir un compte de démonstration**

Sur la page de connexion, cliquez sur un des **4 boutons de démonstration** :

| Bouton | Email | Rôle | Permissions |
|--------|-------|------|-------------|
| **Super Admin** | superadmin@julaba.ci | Super Administrateur | 100% - Accès total |
| **Admin National** | admin.national@julaba.ci | Administrateur National | ~80% - Gestion nationale |
| **Gestionnaire Zone** | gestionnaire.abidjan@julaba.ci | Gestionnaire de Zone | ~50% - Zone Abidjan |
| **Analyste** | analyste@julaba.ci | Analyste | ~30% - Lecture seule |

### **Étape 3 : Le formulaire est pré-rempli**

Après avoir cliqué sur un bouton :
- ✅ **Email** : Rempli automatiquement
- ✅ **Mot de passe** : `demo1234` (pré-rempli)

### **Étape 4 : Cliquer sur "Se connecter"**

Vous serez automatiquement redirigé vers :
```
https://julabacom.vercel.app/backoffice/dashboard
```

---

## 👥 COMPTES DISPONIBLES

### **1. Super Admin** 👑

**Email** : `superadmin@julaba.ci`  
**Mot de passe** : `demo1234`  
**Nom** : Yves-Roland KOUASSI

**Accès** :
- ✅ Tous les modules (100%)
- ✅ Toutes les actions (lecture, écriture, suppression)
- ✅ Gestion des utilisateurs BO
- ✅ Gestion des paramètres système

---

### **2. Admin National** 🌍

**Email** : `admin.national@julaba.ci`  
**Mot de passe** : `demo1234`  
**Nom** : Fatoumata BAMBA

**Accès** :
- ✅ Gestion des acteurs (lecture, écriture, suspension)
- ✅ Validation des enrôlements
- ✅ Supervision nationale
- ❌ Pas de suppression d'acteurs
- ❌ Pas de gestion des paramètres

---

### **3. Gestionnaire Zone** 📍

**Email** : `gestionnaire.abidjan@julaba.ci`  
**Mot de passe** : `demo1234`  
**Nom** : Ange-Désiré KOFFI  
**Zone** : Abidjan

**Accès** :
- ✅ Gestion des acteurs de sa zone
- ✅ Validation des enrôlements
- ✅ Consultation des statistiques
- ❌ Pas de suspension d'acteurs
- ❌ Limité à la zone Abidjan

---

### **4. Analyste** 📊

**Email** : `analyste@julaba.ci`  
**Mot de passe** : `demo1234`  
**Nom** : Esther YAO

**Accès** :
- ✅ Lecture seule sur tous les modules
- ✅ Export de rapports
- ❌ Aucune modification possible
- ❌ Rôle consultant uniquement

---

## 📋 MODULES ACCESSIBLES

Une fois connecté, vous avez accès à :

| Module | Route | Description |
|--------|-------|-------------|
| 📊 **Dashboard** | `/backoffice/dashboard` | Vue d'ensemble des KPI |
| 👥 **Acteurs** | `/backoffice/acteurs` | Gestion Marchands, Producteurs, etc. |
| 📝 **Enrôlement** | `/backoffice/enrolement` | Validation des inscriptions |
| 👁️ **Supervision** | `/backoffice/supervision` | Surveillance temps réel |
| 🗺️ **Zones** | `/backoffice/zones` | Gestion géographique |
| 💰 **Commissions** | `/backoffice/commissions` | Paiements identificateurs |
| 🎓 **Academy** | `/backoffice/academy` | Plateforme de formation |
| 🎯 **Missions** | `/backoffice/missions` | Gestion des missions |
| ⚙️ **Paramètres** | `/backoffice/parametres` | Configuration système |
| 📜 **Audit** | `/backoffice/audit` | Journal d'audit |
| 👤 **Utilisateurs** | `/backoffice/utilisateurs` | Gestion utilisateurs BO |
| 🏢 **Institutions** | `/backoffice/institutions` | Institutions partenaires |
| 📈 **Rapports** | `/backoffice/rapports` | Exports et rapports |
| 🔔 **Notifications** | `/backoffice/notifications` | Notifications système |
| 🆘 **Support** | `/backoffice/support` | Tickets support |

---

## 🔐 CONNEXION MANUELLE

Si vous préférez saisir les identifiants manuellement :

### **Formulaire de connexion**

1. **Email** : Saisir l'email complet (ex: `superadmin@julaba.ci`)
2. **Mot de passe** : Saisir `demo1234`
3. **Cliquer** sur "Se connecter"

**Note** : Pour l'instant, tous les comptes utilisent le mot de passe `demo1234` (démonstration).

---

## 🚪 DÉCONNEXION

Pour se déconnecter :

1. **Cliquer** sur le bouton de déconnexion en haut à droite
2. **Ou** : Cliquer sur votre profil → "Déconnexion"

Vous serez automatiquement redirigé vers `/backoffice/login`

---

## 🔒 SÉCURITÉ

### **Système actuel (démonstration)**

- ✅ Authentification par email
- ⚠️ Mot de passe unique pour tous les comptes (`demo1234`)
- ⚠️ Validation contre une liste pré-définie (MOCK_BO_USERS)

### **Prochaines étapes (production)**

Pour sécuriser le Back-Office en production :

1. **Intégration Supabase Auth**
   - Stockage sécurisé des utilisateurs BO
   - Hashage des mots de passe
   - Sessions sécurisées

2. **Authentification OTP (optionnel)**
   - OTP par SMS via Wassoya
   - Authentification à 2 facteurs

3. **Gestion des permissions**
   - Système RBAC complet
   - Permissions granulaires par module

---

## ⚠️ NOTES IMPORTANTES

### **Comptes de démonstration**

Les comptes actuels sont des **comptes de démonstration** :
- ✅ Parfaits pour tester l'application
- ✅ Toutes les fonctionnalités sont disponibles
- ⚠️ Ne pas utiliser en production avec des données réelles

### **Données persistantes**

- ✅ La base de données Supabase est connectée
- ✅ Les actions dans le BO modifient les vraies données
- ⚠️ Les logs d'audit sont enregistrés

---

## 🎯 RÉSUMÉ RAPIDE

```
1. Aller sur : https://julabacom.vercel.app/backoffice/login
2. Cliquer sur "Super Admin" (bouton de démonstration)
3. Cliquer sur "Se connecter"
4. Vous êtes connecté au Back-Office !
```

**Temps estimé** : 10 secondes ⚡

---

## 📞 SUPPORT

En cas de problème :

1. **Vérifier l'URL** : https://julabacom.vercel.app/backoffice/login
2. **Rafraîchir la page** (F5)
3. **Vider le cache** si nécessaire
4. **Vérifier la console** pour les erreurs

---

## 🔄 ACCÈS RAPIDE

**Liens directs** :

- 🔐 **Login** : https://julabacom.vercel.app/backoffice/login
- 📊 **Dashboard** : https://julabacom.vercel.app/backoffice/dashboard (nécessite connexion)
- 👥 **Acteurs** : https://julabacom.vercel.app/backoffice/acteurs (nécessite connexion)

**Credentials** :

```
Email : superadmin@julaba.ci
Mot de passe : demo1234
```

---

**Dernière mise à jour** : 5 mars 2026  
**Version** : 2.0.0 (Production ready)  
**Environnement** : ✅ Production (https://julabacom.vercel.app/)
