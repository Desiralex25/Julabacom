# 🔐 FLUX DE CONNEXION JÙLABA - GUIDE COMPLET

## 🎯 VUE D'ENSEMBLE

La connexion à Jùlaba utilise **Supabase** pour l'authentification et l'accès aux données.  
Il existe **3 méthodes de connexion** selon le contexte.

---

## 📱 MÉTHODE 1 : CONNEXION OTP (SMS) - UTILISATEURS FINAUX

### **Flux complet**

```
┌─────────────────────────────────────────────────────────────────┐
│  1. DEMANDE OTP                                                 │
├─────────────────────────────────────────────────────────────────┤
│  Frontend → Backend : POST /auth/send-otp                       │
│  Body: { phone: "0707123456" }                                  │
│                                                                 │
│  Backend:                                                       │
│  - Génère code OTP aléatoire (4 chiffres)                      │
│  - Stocke dans kv_store: "otp:0707123456"                      │
│  - Envoie SMS via Wassoya                                       │
│  - Retourne succès (en dev: retourne aussi le code)            │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│  2. VÉRIFICATION OTP                                            │
├─────────────────────────────────────────────────────────────────┤
│  Frontend → Backend : POST /auth/verify-otp                     │
│  Body: { phone: "0707123456", code: "4582" }                    │
│                                                                 │
│  Backend:                                                       │
│  - Récupère OTP depuis kv_store                                │
│  - Vérifie code et expiration                                  │
│  - Cherche utilisateur dans users_julaba                       │
│                                                                 │
│  SI UTILISATEUR EXISTE:                                         │
│  - Crée session Supabase avec signInWithPassword()            │
│  - Retourne accessToken + refreshToken + profil               │
│                                                                 │
│  SI NOUVEL UTILISATEUR:                                         │
│  - Retourne { newUser: true, phone: "..." }                    │
│  - Frontend redirige vers /onboarding                          │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│  3. UTILISATION ACCESS TOKEN                                    │
├─────────────────────────────────────────────────────────────────┤
│  Frontend stocke:                                               │
│  - accessToken dans localStorage                                │
│  - refreshToken dans localStorage                               │
│  - user data dans state/context                                │
│                                                                 │
│  Toutes les requêtes suivantes:                                │
│  Headers: { Authorization: "Bearer {accessToken}" }            │
└─────────────────────────────────────────────────────────────────┘
```

### **Code Frontend**

```typescript
// Fichier: /src/app/pages/Login.tsx

// ÉTAPE 1: Demander OTP
const sendOTP = async (phone: string) => {
  const response = await fetch(
    `https://${projectId}.supabase.co/functions/v1/make-server-488793d3/auth/send-otp`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${publicAnonKey}`,
      },
      body: JSON.stringify({ phone }),
    }
  );
  
  const data = await response.json();
  if (data.success) {
    console.log('OTP envoyé !');
    // En dev, data.devOnly.code contient le code
  }
};

// ÉTAPE 2: Vérifier OTP
const verifyOTP = async (phone: string, code: string) => {
  const response = await fetch(
    `https://${projectId}.supabase.co/functions/v1/make-server-488793d3/auth/verify-otp`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${publicAnonKey}`,
      },
      body: JSON.stringify({ phone, code }),
    }
  );
  
  const data = await response.json();
  
  if (data.success && !data.newUser) {
    // Utilisateur existant - connecté !
    localStorage.setItem('accessToken', data.accessToken);
    localStorage.setItem('refreshToken', data.refreshToken);
    localStorage.setItem('user', JSON.stringify(data.user));
    
    // Rediriger selon le rôle
    navigate(`/${data.user.role}`);
  } else if (data.newUser) {
    // Nouvel utilisateur - onboarding
    navigate('/onboarding', { state: { phone } });
  }
};

// ÉTAPE 3: Utiliser l'access token
const getProfile = async () => {
  const accessToken = localStorage.getItem('accessToken');
  
  const response = await fetch(
    `https://${projectId}.supabase.co/functions/v1/make-server-488793d3/auth/me`,
    {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    }
  );
  
  const data = await response.json();
  return data.user;
};
```

### **Code Backend**

```typescript
// Fichier: /supabase/functions/server/index.tsx

// ENDPOINT: POST /auth/send-otp
app.post("/make-server-488793d3/auth/send-otp", async (c) => {
  const { phone } = await c.req.json();
  
  // Générer code OTP
  const otpCode = Math.floor(1000 + Math.random() * 9000).toString();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();
  
  // Stocker dans KV
  await kv.set(`otp:${phone}`, {
    code: otpCode,
    expiresAt: expiresAt,
    attempts: 0,
    createdAt: new Date().toISOString()
  });
  
  // Envoyer SMS via Wassoya
  const smsMessage = `Votre code Jùlaba : ${otpCode}\nValide 10 minutes.`;
  await sendSMS(phone, smsMessage);
  
  return c.json({ success: true, message: 'Code OTP envoyé' });
});

// ENDPOINT: POST /auth/verify-otp
app.post("/make-server-488793d3/auth/verify-otp", async (c) => {
  const { phone, code } = await c.req.json();
  
  // Récupérer OTP
  const otpData = await kv.get(`otp:${phone}`);
  
  // Vérifier code
  if (otpData.code !== code) {
    return c.json({ error: 'Code incorrect' }, 401);
  }
  
  // Vérifier expiration
  if (new Date(otpData.expiresAt) < new Date()) {
    return c.json({ error: 'Code expiré' }, 401);
  }
  
  // Supprimer OTP
  await kv.del(`otp:${phone}`);
  
  // Chercher utilisateur
  const { data: userProfile } = await supabase
    .from('users_julaba')
    .select('*')
    .eq('phone', phone)
    .single();
  
  if (!userProfile) {
    // Nouvel utilisateur
    return c.json({ success: true, newUser: true, phone });
  }
  
  // Créer session Supabase
  const authEmail = `${phone}@julaba.local`;
  const { data: authData } = await supabase.auth.signInWithPassword({
    email: authEmail,
    password: phone
  });
  
  return c.json({
    success: true,
    newUser: false,
    accessToken: authData.session.access_token,
    refreshToken: authData.session.refresh_token,
    user: userProfile
  });
});
```

---

## 🔑 MÉTHODE 2 : CONNEXION MOT DE PASSE - BACK-OFFICE

### **Flux complet**

```
┌─────────────────────────────────────────────────────────────────┐
│  1. LOGIN CLASSIQUE                                             │
├─────────────────────────────────────────────────────────────────┤
│  Frontend → Backend : POST /auth/login                          │
│  Body: { phone: "0707123456", password: "MonMotDePasse123" }    │
│                                                                 │
│  Backend:                                                       │
│  - Appelle supabase.auth.signInWithPassword()                  │
│  - Email = {phone}@julaba.local                                │
│  - Récupère profil depuis users_julaba                         │
│  - Met à jour last_login_at                                    │
│  - Retourne accessToken + refreshToken + profil               │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│  2. VÉRIFICATION RÔLE (BACK-OFFICE)                             │
├─────────────────────────────────────────────────────────────────┤
│  Frontend vérifie:                                              │
│  - Si user.role !== 'admin' → Bloquer accès BO                │
│  - OU vérifier permission dans user_metadata                   │
│                                                                 │
│  Note: Le système RBAC du BO utilise localStorage              │
│  - Rôles: super_admin, gestionnaire, analyste, operateur       │
└─────────────────────────────────────────────────────────────────┘
```

### **Code Frontend**

```typescript
// Fichier: /src/app/components/backoffice/BOLogin.tsx

const login = async (phone: string, password: string) => {
  const response = await fetch(
    `https://${projectId}.supabase.co/functions/v1/make-server-488793d3/auth/login`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${publicAnonKey}`,
      },
      body: JSON.stringify({ phone, password }),
    }
  );
  
  const data = await response.json();
  
  if (data.success) {
    localStorage.setItem('accessToken', data.accessToken);
    localStorage.setItem('user', JSON.stringify(data.user));
    
    // Vérifier si c'est un admin (à implémenter)
    if (data.user.role === 'admin') {
      navigate('/backoffice');
    } else {
      alert('Accès refusé - Admin uniquement');
    }
  }
};
```

### **Code Backend**

```typescript
// Fichier: /supabase/functions/server/index.tsx

app.post("/make-server-488793d3/auth/login", async (c) => {
  const { phone, password } = await c.req.json();
  
  // Connexion Supabase Auth
  const authEmail = `${phone}@julaba.local`;
  const { data: authData, error } = await supabase.auth.signInWithPassword({
    email: authEmail,
    password: password
  });
  
  if (error) {
    return c.json({ error: 'Identifiants incorrects' }, 401);
  }
  
  // Récupérer profil complet
  const { data: userProfile } = await supabase
    .from('users_julaba')
    .select('*')
    .eq('auth_user_id', authData.user.id)
    .single();
  
  // Mettre à jour last_login_at
  await supabase
    .from('users_julaba')
    .update({ last_login_at: new Date().toISOString() })
    .eq('id', userProfile.id);
  
  return c.json({
    success: true,
    accessToken: authData.session.access_token,
    refreshToken: authData.session.refresh_token,
    user: userProfile
  });
});
```

---

## 🛠️ MÉTHODE 3 : CONNEXION SERVEUR (BACKEND)

### **Flux complet**

```
┌─────────────────────────────────────────────────────────────────┐
│  BACKEND SUPABASE EDGE FUNCTIONS                                │
├─────────────────────────────────────────────────────────────────┤
│  Le backend utilise le SERVICE ROLE KEY                        │
│  - Accès complet à toutes les tables (bypass RLS)             │
│  - Utilisé pour créer des utilisateurs, gérer les données     │
│                                                                 │
│  Initialisation:                                                │
│  const supabaseUrl = Deno.env.get('SUPABASE_URL')              │
│  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') │
│  const supabase = createClient(supabaseUrl, supabaseServiceKey)│
│                                                                 │
│  Ensuite: accès direct aux tables                              │
│  await supabase.from('users_julaba').select('*')               │
└─────────────────────────────────────────────────────────────────┘
```

### **Code Backend**

```typescript
// Fichier: /supabase/functions/server/index.tsx

// INITIALISATION (au démarrage)
const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// EXEMPLE: Créer un utilisateur
app.post("/make-server-488793d3/auth/signup", async (c) => {
  const { phone, password, firstName, lastName, role } = await c.req.json();
  
  // 1. Créer utilisateur dans Supabase Auth
  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email: `${phone}@julaba.local`,
    password: password,
    email_confirm: true,
    user_metadata: { phone, first_name: firstName, last_name: lastName, role }
  });
  
  if (authError) {
    return c.json({ error: 'Erreur création compte' }, 500);
  }
  
  // 2. Créer profil dans users_julaba
  const { data: userProfile, error: profileError } = await supabase
    .from('users_julaba')
    .insert({
      auth_user_id: authData.user.id,
      phone,
      first_name: firstName,
      last_name: lastName,
      role,
      score: 50,
      validated: false,
      verified_phone: true
    })
    .select()
    .single();
  
  if (profileError) {
    // Rollback: supprimer auth user
    await supabase.auth.admin.deleteUser(authData.user.id);
    return c.json({ error: 'Erreur création profil' }, 500);
  }
  
  return c.json({ success: true, user: userProfile }, 201);
});

// EXEMPLE: Endpoint protégé (vérifier access token)
app.get("/make-server-488793d3/auth/me", async (c) => {
  const accessToken = c.req.header('Authorization')?.split(' ')[1];
  
  if (!accessToken) {
    return c.json({ error: 'Token manquant' }, 401);
  }
  
  // Vérifier token
  const { data: { user }, error } = await supabase.auth.getUser(accessToken);
  
  if (error || !user) {
    return c.json({ error: 'Token invalide' }, 401);
  }
  
  // Récupérer profil complet
  const { data: userProfile } = await supabase
    .from('users_julaba')
    .select('*')
    .eq('auth_user_id', user.id)
    .single();
  
  return c.json({ success: true, user: userProfile });
});
```

---

## 🔐 GESTION DES CLÉS ET SECRETS

### **Variables d'environnement**

```bash
# Backend Supabase Edge Functions
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Autres services
ELEVENLABS_API_KEY=sk_xxxxx...
WASSOYA_API_KEY=xxxxx...
WASSOYA_API_URL=https://api.wassoya.com
WASSOYA_SENDER_ID=Julaba
```

### **Où sont stockées les clés ?**

| Contexte | Clés utilisées | Stockage |
|----------|----------------|----------|
| **Frontend** | `SUPABASE_URL`, `SUPABASE_ANON_KEY` | `/utils/supabase/info.tsx` (public) |
| **Backend** | Toutes les clés | Supabase Edge Functions Secrets |
| **Développement** | Toutes | Fichier `.env` (gitignored) |

### **Comment définir les secrets Supabase ?**

```bash
# Via CLI
npx supabase secrets set ELEVENLABS_API_KEY=sk_xxxxx
npx supabase secrets set WASSOYA_API_KEY=xxxxx

# Via Dashboard
1. https://supabase.com/dashboard
2. Project → Edge Functions → Secrets
3. Ajouter chaque secret
```

---

## 🔄 REFRESH TOKEN

### **Pourquoi ?**

Les `accessToken` expirent après **1 heure**. Le `refreshToken` permet de renouveler l'accès sans redemander les identifiants.

### **Code Frontend**

```typescript
const refreshAccessToken = async () => {
  const refreshToken = localStorage.getItem('refreshToken');
  
  if (!refreshToken) {
    // Rediriger vers login
    navigate('/login');
    return;
  }
  
  const { data, error } = await supabase.auth.refreshSession({
    refresh_token: refreshToken
  });
  
  if (error) {
    // Token expiré - redemander login
    localStorage.clear();
    navigate('/login');
    return;
  }
  
  // Mettre à jour les tokens
  localStorage.setItem('accessToken', data.session.access_token);
  localStorage.setItem('refreshToken', data.session.refresh_token);
};

// Vérifier automatiquement toutes les 50 minutes
setInterval(refreshAccessToken, 50 * 60 * 1000);
```

---

## 🚪 DÉCONNEXION

### **Code Frontend**

```typescript
const logout = async () => {
  const accessToken = localStorage.getItem('accessToken');
  
  // Appeler endpoint logout (optionnel)
  await fetch(
    `https://${projectId}.supabase.co/functions/v1/make-server-488793d3/auth/logout`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    }
  );
  
  // Nettoyer localStorage
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('user');
  
  // Rediriger
  navigate('/login');
};
```

---

## 📊 DIAGRAMME COMPLET

```
┌──────────────────────────────────────────────────────────────────┐
│                         FRONTEND (React)                         │
│  - Formulaire login/OTP                                          │
│  - Stocke accessToken, refreshToken, user dans localStorage     │
│  - Envoie Authorization header dans toutes les requêtes         │
└────────────────────┬─────────────────────────────────────────────┘
                     │
                     │ HTTPS (Authorization: Bearer {token})
                     ▼
┌──────────────────────────────────────────────────────────────────┐
│                  BACKEND (Supabase Edge Functions)               │
│  - Endpoint: /auth/send-otp, /auth/verify-otp, /auth/login      │
│  - Utilise SUPABASE_SERVICE_ROLE_KEY                            │
│  - Accède directement aux tables via client Supabase            │
└────────────────────┬─────────────────────────────────────────────┘
                     │
                     │ SQL + Auth API calls
                     ▼
┌──────────────────────────────────────────────────────────────────┐
│                     SUPABASE (PostgreSQL + Auth)                 │
│  ┌────────────────┐  ┌──────────────────┐  ┌─────────────────┐  │
│  │  auth.users    │  │  users_julaba    │  │ kv_store_488793d3│ │
│  │  - id          │  │  - auth_user_id  │  │  - key          │  │
│  │  - email       │  │  - phone         │  │  - value        │  │
│  │  - password    │  │  - role          │  │                 │  │
│  └────────────────┘  └──────────────────┘  └─────────────────┘  │
└──────────────────────────────────────────────────────────────────┘
```

---

## 🎯 RÉSUMÉ RAPIDE

| Méthode | Utilisé par | Endpoint | Identifiants |
|---------|-------------|----------|--------------|
| **OTP SMS** | Utilisateurs finaux | `/auth/send-otp` + `/auth/verify-otp` | Téléphone + Code SMS |
| **Mot de passe** | Back-Office | `/auth/login` | Téléphone + Mot de passe |
| **Service Role** | Backend uniquement | Direct Supabase | `SUPABASE_SERVICE_ROLE_KEY` |

### **Format email universel**
```
{phone}@julaba.local
```
Exemple : `0707123456@julaba.local`

### **Tokens retournés**
- `accessToken` : Utilisé dans `Authorization: Bearer {token}` (expire 1h)
- `refreshToken` : Renouvelle l'access token (expire 30 jours)

---

**Dernière mise à jour** : 5 mars 2026  
**Fichiers clés** :
- Backend : `/supabase/functions/server/index.tsx`
- Frontend Login : `/src/app/pages/Login.tsx`
- Clés Supabase : `/utils/supabase/info.tsx`
