# 🗄️ STRUCTURE DE LA BASE DE DONNÉES - JÙLABA

## 📊 VUE D'ENSEMBLE

La base de données Jùlaba utilise **PostgreSQL via Supabase** avec 2 tables principales :

1. **`users_julaba`** - Profils utilisateurs de la plateforme
2. **`kv_store_488793d3`** - Stockage clé-valeur (système, OTP, paramètres)

---

## 📋 TABLE 1 : `users_julaba`

### **Description**
Table principale contenant tous les profils utilisateurs des 6 types d'acteurs Jùlaba.

### **Colonnes**

| Colonne | Type | Contrainte | Description |
|---------|------|------------|-------------|
| `id` | UUID | PRIMARY KEY, AUTO | Identifiant unique du profil |
| `auth_user_id` | UUID | UNIQUE, FOREIGN KEY | Référence vers auth.users de Supabase |
| `phone` | VARCHAR(10) | UNIQUE, NOT NULL | Numéro de téléphone (format: 0XXXXXXXXX) |
| `first_name` | VARCHAR(100) | NOT NULL | Prénom de l'utilisateur |
| `last_name` | VARCHAR(100) | NOT NULL | Nom de famille |
| `role` | VARCHAR(20) | NOT NULL | Rôle parmi: `marchand`, `producteur`, `cooperative`, `institution`, `identificateur`, `consommateur` |
| `region` | VARCHAR(50) | NULLABLE | Région en Côte d'Ivoire (ex: "Abidjan", "Bouaké") |
| `commune` | VARCHAR(100) | NULLABLE | Commune/ville |
| `activity` | VARCHAR(100) | NULLABLE | Type d'activité (ex: "Maraîchage", "Commerce gros") |
| `market` | VARCHAR(100) | NULLABLE | Nom du marché (pour marchands) |
| `cooperative_name` | VARCHAR(200) | NULLABLE | Nom de la coopérative (pour rôle `cooperative`) |
| `institution_name` | VARCHAR(200) | NULLABLE | Nom de l'institution (pour rôle `institution`) |
| `score` | INTEGER | DEFAULT 50 | Score de réputation (0-100) |
| `validated` | BOOLEAN | DEFAULT FALSE | Profil validé par un identificateur |
| `verified_phone` | BOOLEAN | DEFAULT FALSE | Téléphone vérifié par OTP |
| `photo_url` | TEXT | NULLABLE | URL de la photo de profil |
| `created_at` | TIMESTAMP | DEFAULT NOW() | Date de création du compte |
| `updated_at` | TIMESTAMP | AUTO UPDATE | Dernière mise à jour |
| `last_login_at` | TIMESTAMP | NULLABLE | Dernière connexion |

### **Index**

```sql
CREATE INDEX idx_users_phone ON users_julaba(phone);
CREATE INDEX idx_users_auth_id ON users_julaba(auth_user_id);
CREATE INDEX idx_users_role ON users_julaba(role);
CREATE INDEX idx_users_region ON users_julaba(region);
```

### **Contraintes**

```sql
-- Le rôle doit être l'un des 6 types
CHECK (role IN ('marchand', 'producteur', 'cooperative', 'institution', 'identificateur', 'consommateur'))

-- Le téléphone doit avoir 10 chiffres
CHECK (phone ~ '^[0-9]{10}$')

-- Le score doit être entre 0 et 100
CHECK (score >= 0 AND score <= 100)
```

### **Exemple de données**

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "auth_user_id": "123e4567-e89b-12d3-a456-426614174000",
  "phone": "0707123456",
  "first_name": "Aya",
  "last_name": "Kouassi",
  "role": "marchand",
  "region": "Abidjan",
  "commune": "Adjamé",
  "activity": "Commerce de légumes",
  "market": "Marché d'Adjamé",
  "cooperative_name": null,
  "institution_name": null,
  "score": 75,
  "validated": true,
  "verified_phone": true,
  "photo_url": "https://...",
  "created_at": "2026-03-01T10:30:00Z",
  "updated_at": "2026-03-05T14:20:00Z",
  "last_login_at": "2026-03-05T09:15:00Z"
}
```

### **Relations avec Supabase Auth**

```
users_julaba.auth_user_id → auth.users.id
```

**Format email Auth** : `{phone}@julaba.local` (ex: `0707123456@julaba.local`)

---

## 📋 TABLE 2 : `kv_store_488793d3`

### **Description**
Table de stockage clé-valeur générique pour les paramètres système, codes OTP, sessions, cache, etc.

### **Colonnes**

| Colonne | Type | Contrainte | Description |
|---------|------|------------|-------------|
| `key` | TEXT | PRIMARY KEY | Clé unique (ex: "otp:0707123456", "system:support_phone") |
| `value` | JSONB | NOT NULL | Valeur JSON flexible |

### **Structure SQL**

```sql
CREATE TABLE kv_store_488793d3 (
  key TEXT NOT NULL PRIMARY KEY,
  value JSONB NOT NULL
);
```

### **Conventions de nommage des clés**

| Préfixe | Usage | Exemple |
|---------|-------|---------|
| `otp:{phone}` | Codes OTP de connexion | `otp:0707123456` |
| `system:{param}` | Paramètres système | `system:support_phone` |
| `session:{token}` | Sessions temporaires | `session:abc123def` |
| `cache:{key}` | Données mises en cache | `cache:product_list` |
| `config:{module}` | Configuration modules BO | `config:marchands` |

### **Exemples de données**

#### **1. Code OTP**

```json
// Clé: "otp:0707123456"
{
  "code": "4582",
  "expiresAt": "2026-03-05T10:45:00Z",
  "attempts": 0,
  "createdAt": "2026-03-05T10:35:00Z"
}
```

#### **2. Paramètres système**

```json
// Clé: "system:support_phone"
{
  "value": "0700000000",
  "updatedBy": "admin@julaba.ci",
  "updatedAt": "2026-03-01T08:00:00Z"
}
```

#### **3. Session temporaire**

```json
// Clé: "session:onboarding_0707123456"
{
  "phone": "0707123456",
  "step": "choose_role",
  "data": {
    "firstName": "Aya",
    "lastName": "Kouassi"
  },
  "expiresAt": "2026-03-05T12:00:00Z"
}
```

### **Fonctions utilitaires KV**

```typescript
// Fichier: /supabase/functions/server/kv_store.tsx

// Définir une valeur
await kv.set('key', { data: 'value' });

// Récupérer une valeur
const value = await kv.get('key'); // Retourne l'objet JSON ou null

// Supprimer une clé
await kv.del('key');

// Opérations multiples
await kv.mset(['key1', 'key2'], [value1, value2]);
const values = await kv.mget(['key1', 'key2']);
await kv.mdel(['key1', 'key2']);

// Recherche par préfixe
const otps = await kv.getByPrefix('otp:'); // Tous les OTP
```

---

## 🔐 SUPABASE AUTH (`auth.users`)

### **Description**
Table système Supabase Auth pour l'authentification. Non modifiable directement.

### **Colonnes principales utilisées**

| Colonne | Type | Description |
|---------|------|-------------|
| `id` | UUID | ID unique de l'utilisateur auth |
| `email` | VARCHAR | Email (format: `{phone}@julaba.local`) |
| `encrypted_password` | TEXT | Mot de passe hashé |
| `email_confirmed_at` | TIMESTAMP | Date de confirmation email (auto-confirmé) |
| `user_metadata` | JSONB | Métadonnées custom |
| `created_at` | TIMESTAMP | Date de création |
| `last_sign_in_at` | TIMESTAMP | Dernière connexion |

### **Métadonnées stockées**

```json
{
  "phone": "0707123456",
  "first_name": "Aya",
  "last_name": "Kouassi",
  "role": "marchand"
}
```

---

## 🔗 RELATIONS ENTRE TABLES

```
┌─────────────────┐
│  auth.users     │
│  (Supabase)     │
│  - id (PK)      │
│  - email        │
│  - password     │
└────────┬────────┘
         │
         │ 1:1
         │
         ▼
┌─────────────────────┐
│  users_julaba       │
│  - id (PK)          │
│  - auth_user_id (FK)│◄─── Référence vers auth.users
│  - phone            │
│  - first_name       │
│  - last_name        │
│  - role             │
│  - region           │
│  - score            │
│  - validated        │
└─────────────────────┘

┌─────────────────────┐
│  kv_store_488793d3  │
│  - key (PK)         │
│  - value (JSONB)    │
└─────────────────────┘
    ↑
    │ Stocke les OTP, sessions, configs
    │
```

---

## 📈 STATISTIQUES ET VOLUMES (ESTIMATIONS)

| Table | Lignes estimées | Taille | Croissance |
|-------|-----------------|--------|------------|
| `users_julaba` | ~100K utilisateurs | ~50 MB | +1K/mois |
| `kv_store_488793d3` | ~10K entrées | ~5 MB | Variable (nettoyage auto) |
| `auth.users` | ~100K | ~30 MB | +1K/mois |

---

## 🛠️ REQUÊTES COURANTES

### **1. Récupérer un utilisateur par téléphone**

```sql
SELECT * FROM users_julaba WHERE phone = '0707123456';
```

### **2. Compter les utilisateurs par rôle**

```sql
SELECT role, COUNT(*) as total 
FROM users_julaba 
GROUP BY role;
```

### **3. Utilisateurs validés par région**

```sql
SELECT region, COUNT(*) as validated_users
FROM users_julaba
WHERE validated = true
GROUP BY region
ORDER BY validated_users DESC;
```

### **4. Score moyen par rôle**

```sql
SELECT role, AVG(score) as avg_score
FROM users_julaba
GROUP BY role;
```

### **5. Nettoyer les OTP expirés**

```typescript
// Backend
const otps = await kv.getByPrefix('otp:');
for (const otp of otps) {
  if (new Date(otp.value.expiresAt) < new Date()) {
    await kv.del(otp.key);
  }
}
```

### **6. Récupérer tous les marchands d'Abidjan**

```sql
SELECT * FROM users_julaba
WHERE role = 'marchand' 
  AND region = 'Abidjan'
ORDER BY score DESC;
```

---

## 🔒 SÉCURITÉ ET PERMISSIONS

### **Row Level Security (RLS)**

⚠️ **À implémenter** : Les RLS Supabase doivent être configurés pour sécuriser les données.

```sql
-- Exemple RLS : Utilisateur peut lire son propre profil
CREATE POLICY "Users can read own profile"
ON users_julaba
FOR SELECT
USING (auth.uid() = auth_user_id);

-- Exemple RLS : Utilisateur peut modifier son profil
CREATE POLICY "Users can update own profile"
ON users_julaba
FOR UPDATE
USING (auth.uid() = auth_user_id);

-- Admin peut tout lire (via service role key côté serveur)
```

### **Accès KV Store**

Le KV Store est accessible **uniquement côté serveur** via le Service Role Key.

---

## 🚀 MIGRATIONS FUTURES (NON IMPLÉMENTÉES)

Ces tables seront nécessaires pour les fonctionnalités avancées :

### **Table `products`**

```sql
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id UUID REFERENCES users_julaba(id),
  name VARCHAR(200) NOT NULL,
  category VARCHAR(50),
  price DECIMAL(10, 2),
  unit VARCHAR(20),
  stock INTEGER,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### **Table `transactions`**

```sql
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  buyer_id UUID REFERENCES users_julaba(id),
  seller_id UUID REFERENCES users_julaba(id),
  product_id UUID REFERENCES products(id),
  quantity INTEGER,
  total_amount DECIMAL(10, 2),
  status VARCHAR(20), -- 'pending', 'completed', 'cancelled'
  created_at TIMESTAMP DEFAULT NOW()
);
```

### **Table `ratings`**

```sql
CREATE TABLE ratings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rater_id UUID REFERENCES users_julaba(id),
  rated_user_id UUID REFERENCES users_julaba(id),
  transaction_id UUID REFERENCES transactions(id),
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### **Table `notifications`**

```sql
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users_julaba(id),
  title VARCHAR(200),
  message TEXT,
  type VARCHAR(50), -- 'info', 'warning', 'success', 'transaction'
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

## 📝 COMMENT CRÉER LES TABLES

### **Option 1 : Via Supabase Dashboard (Recommandé)**

1. Aller sur https://supabase.com/dashboard
2. Sélectionner votre projet Jùlaba
3. **Table Editor** → **New Table**
4. Créer `users_julaba` avec les colonnes ci-dessus
5. Créer `kv_store_488793d3` (déjà créée automatiquement)

### **Option 2 : Via SQL Editor**

1. Aller dans **SQL Editor**
2. Copier-coller le script SQL complet (voir ci-dessous)
3. Exécuter

### **Script SQL complet**

```sql
-- ═══════════════════════════════════════════════════════════════
-- TABLE 1 : users_julaba
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS users_julaba (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  phone VARCHAR(10) UNIQUE NOT NULL CHECK (phone ~ '^[0-9]{10}$'),
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  role VARCHAR(20) NOT NULL CHECK (role IN ('marchand', 'producteur', 'cooperative', 'institution', 'identificateur', 'consommateur')),
  region VARCHAR(50),
  commune VARCHAR(100),
  activity VARCHAR(100),
  market VARCHAR(100),
  cooperative_name VARCHAR(200),
  institution_name VARCHAR(200),
  score INTEGER DEFAULT 50 CHECK (score >= 0 AND score <= 100),
  validated BOOLEAN DEFAULT FALSE,
  verified_phone BOOLEAN DEFAULT FALSE,
  photo_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_login_at TIMESTAMP WITH TIME ZONE
);

-- Index pour performance
CREATE INDEX IF NOT EXISTS idx_users_phone ON users_julaba(phone);
CREATE INDEX IF NOT EXISTS idx_users_auth_id ON users_julaba(auth_user_id);
CREATE INDEX IF NOT EXISTS idx_users_role ON users_julaba(role);
CREATE INDEX IF NOT EXISTS idx_users_region ON users_julaba(region);

-- Trigger pour updated_at automatique
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_julaba_updated_at
  BEFORE UPDATE ON users_julaba
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ═══════════════════════════════════════════════════════════════
-- TABLE 2 : kv_store_488793d3
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS kv_store_488793d3 (
  key TEXT NOT NULL PRIMARY KEY,
  value JSONB NOT NULL
);

-- Index pour recherche par préfixe
CREATE INDEX IF NOT EXISTS idx_kv_key_prefix ON kv_store_488793d3 USING btree (key text_pattern_ops);

-- ═══════════════════════════════════════════════════════════════
-- DONNÉES DE TEST (Optionnel)
-- ═══════════════════════════════════════════════════════════════

-- Paramètres système par défaut
INSERT INTO kv_store_488793d3 (key, value) VALUES
  ('system:support_phone', '"0700000000"'::jsonb)
ON CONFLICT (key) DO NOTHING;
```

---

## 🎯 RÉSUMÉ

| Élément | Description |
|---------|-------------|
| **Tables principales** | `users_julaba`, `kv_store_488793d3` |
| **Auth** | Supabase Auth (`auth.users`) |
| **Total colonnes users_julaba** | 18 colonnes |
| **Flexibilité KV Store** | Illimitée (JSONB) |
| **Accès** | Backend via Service Role Key |
| **RLS** | À configurer |

---

**Dernière mise à jour** : 5 mars 2026  
**Auteur** : Équipe Jùlaba  
**Base de données** : PostgreSQL 15 (Supabase)
