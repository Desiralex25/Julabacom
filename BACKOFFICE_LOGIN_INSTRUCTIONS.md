# 🔐 Instructions de Connexion au Back-Office JÙLABA

## ✅ Système Unifié Implémenté

Le système de connexion du Back-Office a été **simplifié et unifié** avec le système principal.

---

## 📍 URLs d'Accès

### **1. Créer le Premier Super Admin** (À faire une seule fois)

```
https://julabacom.vercel.app/create-super-admin
```

**Étapes :**
1. Aller sur cette URL
2. Remplir le formulaire :
   - **Téléphone** : `0700000001` (ou un autre numéro à 10 chiffres)
   - **Prénom** : Ton prénom
   - **Nom** : Ton nom
   - **Mot de passe** : Un mot de passe fort (minimum 8 caractères)
3. Cliquer sur "Créer le Super Admin"
4. Une fois créé, cette route sera automatiquement désactivée

---

### **2. Se Connecter au Back-Office**

```
https://julabacom.vercel.app/backoffice/login
```

**Ou simplement :**

```
https://julabacom.vercel.app/
```

**Identifiants :**
- **Téléphone** : Le numéro utilisé lors de la création (ex: `0700000001`)
- **Mot de passe** : Le mot de passe défini lors de la création

**Après connexion réussie :**
- ✅ Redirection automatique vers `/backoffice/dashboard`
- ✅ Accès aux 14 modules du Back-Office
- ✅ Système RBAC 4 rôles opérationnel

---

## 🔧 Changements Techniques Effectués

### **1. Suppression de BOLogin.tsx**
- ❌ Ancien : Page de connexion séparée avec comptes MOCK
- ✅ Nouveau : Connexion unifiée via `LoginPassword.tsx`

### **2. Redirection Automatique**
- Les utilisateurs avec `role = 'super_admin'` sont automatiquement redirigés vers `/backoffice/dashboard`
- Les autres rôles gardent leur redirection habituelle

### **3. Route Backend Ajoutée**
- **POST** `/auth/create-super-admin`
- Permet de créer le premier compte Super Admin
- **Sécurité** : Refuse la création si un Super Admin existe déjà

### **4. Routes Modifiées**
- `/backoffice/login` → Affiche `LoginPassword.tsx` (au lieu de `BOLogin.tsx`)
- `/backoffice` → Redirige vers `/backoffice/dashboard` (au lieu de `/backoffice/login`)

---

## 🎯 Workflow Complet

### **Première Utilisation (Bootstrap)**

1. Aller sur `https://julabacom.vercel.app/create-super-admin`
2. Créer le compte Super Admin initial
3. Noter les identifiants de connexion

### **Connexions Suivantes**

1. Aller sur `https://julabacom.vercel.app/backoffice/login`
2. Se connecter avec :
   - **Téléphone** + **Mot de passe**
3. Redirection automatique vers le Back-Office

---

## 🔐 Sécurité

### **Protections Implémentées**

✅ **1. Limitation de création**
- Un seul Super Admin peut être créé via la route `/create-super-admin`
- Les Super Admins suivants doivent être créés depuis le Back-Office

✅ **2. Protection des tentatives**
- Maximum 5 tentatives de connexion
- Blocage de 15 minutes après 5 échecs

✅ **3. Authentification Supabase**
- Tous les comptes utilisent Supabase Auth
- Mots de passe cryptés via bcrypt
- Tokens JWT pour les sessions

✅ **4. RBAC 4 Rôles**
- Super Admin
- Admin National
- Gestionnaire de Zone
- Analyste

---

## 🚀 Prochaines Étapes

### **Optionnel : Créer des Admins Supplémentaires**

Une fois connecté en tant que Super Admin, tu peux créer d'autres comptes administrateurs depuis :

```
/backoffice/utilisateurs
```

Avec différents niveaux d'accès selon le rôle.

---

## 📞 Support

Pour toute question ou problème :
- Vérifier les logs console du navigateur
- Vérifier les logs Supabase Edge Functions
- Contacter le support technique JÙLABA

---

**Dernière mise à jour** : Mars 2026
**Version** : 1.0.0
