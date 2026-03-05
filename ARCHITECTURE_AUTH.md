# 🏗️ Architecture d'Authentification JÙLABA

## 📐 Vue d'Ensemble

```
┌─────────────────────────────────────────────────────────────┐
│                    FRONTEND (React)                         │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────────────┐        ┌──────────────────┐         │
│  │  LoginPassword   │        │  Login (OTP)     │         │
│  │  (Téléphone +    │        │  (SMS OTP)       │         │
│  │   Mot de passe)  │        │                  │         │
│  └────────┬─────────┘        └────────┬─────────┘         │
│           │                           │                    │
│           └───────────┬───────────────┘                    │
│                       │                                    │
│                       ▼                                    │
│           ┌───────────────────────┐                        │
│           │   UserContext         │                        │
│           │   AppContext          │                        │
│           └───────────┬───────────┘                        │
│                       │                                    │
└───────────────────────┼────────────────────────────────────┘
                        │
                        │ HTTPS
                        │
┌───────────────────────▼────────────────────────────────────┐
│              SUPABASE EDGE FUNCTIONS                       │
│                   (Hono Server)                            │
├────────────────────────────────────────────────────────────┤
│                                                            │
│  Routes d'authentification :                              │
│                                                            │
│  POST /auth/signup                                         │
│  POST /auth/login                                          │
│  POST /auth/create-super-admin                             │
│  POST /auth/send-otp                                       │
│  POST /auth/verify-otp                                     │
│  POST /auth/check-phone-for-reset                          │
│  GET  /auth/me                                             │
│                                                            │
└───────────────────────┬────────────────────────────────────┘
                        │
                        │
        ┌───────────────┼───────────────┐
        │               │               │
        ▼               ▼               ▼
┌──────────────┐ ┌──────────┐ ┌──────────────┐
│  Supabase    │ │ Supabase │ │   Wassoya    │
│    Auth      │ │    DB    │ │   SMS API    │
│              │ │          │ │              │
│  - Tokens    │ │ users_   │ │  - OTP SMS   │
│  - Sessions  │ │ julaba   │ │              │
└──────────────┘ └──────────┘ └──────────────┘
```

---

## 🔐 Flux d'Authentification

### **1. Connexion par Mot de Passe** (Back-Office & Identificateurs)

```
┌─────────────┐
│   USER      │
│ Enter:      │
│ - Phone     │
│ - Password  │
└──────┬──────┘
       │
       ▼
┌─────────────────────────────────────────┐
│  Frontend (LoginPassword.tsx)           │
│  - Validation téléphone (10 chiffres)   │
│  - Vérification blocage (5 tentatives)  │
└──────┬──────────────────────────────────┘
       │
       │ POST /auth/login
       ▼
┌─────────────────────────────────────────┐
│  Backend (Hono Server)                  │
│  1. Format email: phone@julaba.local    │
│  2. Supabase Auth.signInWithPassword    │
│  3. Récupérer profil users_julaba       │
│  4. Générer tokens JWT                  │
└──────┬──────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────┐
│  Supabase Auth                          │
│  - Vérifier email/password              │
│  - Générer access_token                 │
│  - Générer refresh_token                │
└──────┬──────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────┐
│  Supabase DB                            │
│  SELECT * FROM users_julaba             │
│  WHERE auth_user_id = {id}              │
└──────┬──────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────┐
│  Frontend (LoginPassword.tsx)           │
│  1. Sauvegarder tokens localStorage     │
│  2. Sauvegarder user dans contextes     │
│  3. Redirection selon rôle:             │
│     - super_admin → /backoffice/dash... │
│     - identificateur → /identificateur  │
│     - marchand → /marchand              │
└─────────────────────────────────────────┘
```

---

### **2. Connexion par OTP SMS** (Acteurs Terrain)

```
┌─────────────┐
│   USER      │
│ Enter:      │
│ - Phone     │
└──────┬──────┘
       │
       ▼
┌─────────────────────────────────────────┐
│  Frontend (Login.tsx)                   │
│  - Validation téléphone (10 chiffres)   │
└──────┬──────────────────────────────────┘
       │
       │ POST /auth/send-otp
       ▼
┌─────────────────────────────────────────┐
│  Backend (Hono Server)                  │
│  1. Vérifier phone existe dans DB       │
│  2. Générer code OTP (4 chiffres)       │
│  3. Sauvegarder dans KV Store           │
│  4. Appeler Wassoya SMS API             │
└──────┬──────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────┐
│  Wassoya SMS API                        │
│  - Envoyer SMS avec code OTP            │
│  - Retour status delivery               │
└──────┬──────────────────────────────────┘
       │
       ▼
┌─────────────┐
│   USER      │
│ Receive SMS │
│ Code: 1234  │
│ Enter code  │
└──────┬──────┘
       │
       │ POST /auth/verify-otp
       ▼
┌─────────────────────────────────────────┐
│  Backend (Hono Server)                  │
│  1. Récupérer code depuis KV Store      │
│  2. Vérifier code & expiration          │
│  3. Connexion Supabase Auth             │
│  4. Générer tokens                      │
└──────┬──────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────┐
│  Frontend (Login.tsx)                   │
│  1. Sauvegarder tokens                  │
│  2. Redirection selon rôle              │
└─────────────────────────────────────────┘
```

---

## 🗄️ Structure Base de Données

### **Table : users_julaba**

```sql
CREATE TABLE users_julaba (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_user_id UUID REFERENCES auth.users(id),
  phone VARCHAR(10) UNIQUE NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  role VARCHAR(50) NOT NULL,
  region VARCHAR(100),
  commune VARCHAR(100),
  activity VARCHAR(100),
  market VARCHAR(100),
  cooperative_name VARCHAR(200),
  institution_name VARCHAR(200),
  score INTEGER DEFAULT 50,
  validated BOOLEAN DEFAULT false,
  verified_phone BOOLEAN DEFAULT false,
  last_login_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);
```

**Rôles disponibles :**
- `marchand`
- `producteur`
- `cooperative`
- `institution`
- `identificateur`
- `consommateur`
- `super_admin`

---

### **Table : auth.users** (Supabase Auth)

```sql
-- Gérée automatiquement par Supabase
-- Format email : {phone}@julaba.local
-- Exemple : 0700000001@julaba.local

{
  id: "uuid",
  email: "0700000001@julaba.local",
  encrypted_password: "bcrypt_hash",
  email_confirmed_at: "timestamp",
  user_metadata: {
    phone: "0700000001",
    first_name: "Prénom",
    last_name: "Nom",
    role: "super_admin"
  }
}
```

---

### **KV Store : OTP Codes**

```typescript
// Clé : otp:{phone}
// Valeur :
{
  code: "1234",
  expiresAt: "2026-03-05T12:00:00Z",
  attempts: 0
}

// TTL : 5 minutes
```

---

## 🔑 Gestion des Tokens

### **Access Token** (JWT)
```
Durée : 1 heure
Stockage : localStorage ('julaba_access_token')
Usage : Header Authorization: Bearer {token}
```

### **Refresh Token** (JWT)
```
Durée : 7 jours
Stockage : localStorage ('julaba_refresh_token')
Usage : Renouveler l'access_token automatiquement
```

---

## 🛡️ Sécurité

### **1. Limitation de Tentatives**

```typescript
// Frontend (LoginPassword.tsx)
const loginAttempts: Record<string, { 
  count: number; 
  lastAttempt: number 
}> = {};

const MAX_ATTEMPTS = 5;
const LOCKOUT_DURATION = 15 * 60 * 1000; // 15 min
```

### **2. Validation Backend**

```typescript
// Vérifications systématiques :
- Format téléphone (10 chiffres)
- Longueur mot de passe (min 8 caractères)
- Expiration OTP (5 minutes)
- Existence utilisateur
- Rôle valide
```

### **3. Protection Routes**

```typescript
// Routes protégées nécessitent :
Authorization: Bearer {access_token}

// Backend vérifie :
const { data: { user }, error } = await supabase.auth.getUser(token);
if (!user) return 401 Unauthorized;
```

---

## 🚀 Routes API Complètes

### **POST /auth/signup**
```json
Body: {
  "phone": "0700000001",
  "password": "password123",
  "firstName": "Prénom",
  "lastName": "Nom",
  "role": "marchand",
  "region": "Abidjan",
  "commune": "Cocody"
}

Response: {
  "success": true,
  "user": { ... }
}
```

### **POST /auth/login**
```json
Body: {
  "phone": "0700000001",
  "password": "password123"
}

Response: {
  "success": true,
  "accessToken": "jwt_token",
  "refreshToken": "jwt_token",
  "user": { ... }
}
```

### **POST /auth/create-super-admin**
```json
Body: {
  "phone": "0700000001",
  "password": "securepass123",
  "firstName": "Super",
  "lastName": "Admin"
}

Response: {
  "success": true,
  "message": "Compte Super Admin créé avec succès",
  "user": { ... }
}

⚠️ Note : Route désactivée si un Super Admin existe déjà
```

### **POST /auth/send-otp**
```json
Body: {
  "phone": "0700000001"
}

Response: {
  "success": true,
  "message": "Code OTP envoyé",
  "code": "1234" // En mode dev uniquement
}
```

### **POST /auth/verify-otp**
```json
Body: {
  "phone": "0700000001",
  "code": "1234"
}

Response: {
  "success": true,
  "accessToken": "jwt_token",
  "refreshToken": "jwt_token",
  "user": { ... },
  "newUser": false
}
```

### **GET /auth/me**
```json
Headers: {
  "Authorization": "Bearer {access_token}"
}

Response: {
  "success": true,
  "user": { ... }
}
```

---

## 🎯 Redirection par Rôle

```typescript
const roleRoutes: Record<string, string> = {
  'marchand': '/marchand',
  'producteur': '/producteur',
  'cooperative': '/cooperative',
  'institution': '/institution',
  'identificateur': '/identificateur',
  'consommateur': '/consommateur',
  'super_admin': '/backoffice/dashboard'
};
```

---

## 📊 Système RBAC (Role-Based Access Control)

### **Super Admin**
```
✅ Accès complet à tous les modules
✅ Gestion des utilisateurs
✅ Configuration système
✅ Audit complet
```

### **Admin National**
```
✅ Supervision nationale
✅ Rapports & analytics
✅ Gestion zones
❌ Configuration système
```

### **Gestionnaire Zone**
```
✅ Supervision régionale
✅ Gestion acteurs de sa zone
❌ Configuration nationale
```

### **Analyste**
```
✅ Consultation rapports
✅ Export données
❌ Modification données
```

---

## 🔄 Workflow Complet

```
1. USER → Page de connexion
2. Saisie identifiants (Phone + Password)
3. Frontend → Validation locale
4. Frontend → POST /auth/login
5. Backend → Vérification Supabase Auth
6. Backend → Récupération profil DB
7. Backend → Génération tokens
8. Backend → Retour user + tokens
9. Frontend → Sauvegarde tokens
10. Frontend → Sauvegarde user (contextes)
11. Frontend → Redirection selon rôle
12. USER → Dashboard approprié
```

---

**Documentation Version** : 1.0.0  
**Dernière mise à jour** : Mars 2026  
**Architecture** : React + Supabase + Hono
