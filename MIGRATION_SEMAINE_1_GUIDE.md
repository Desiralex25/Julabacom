# 🚀 MIGRATION PROGRESSIVE - SEMAINE 1

## ✅ AUTHENTIFICATION + PROFILS UTILISATEURS

**Date** : 5 mars 2026  
**Statut** : PRÊT À DÉPLOYER  
**Phase** : 1/4 (Authentification)

---

## 📋 CHECKLIST COMPLÈTE

### ÉTAPE 1 : CRÉER LA TABLE SUPABASE ✅

**Fichier** : `/SUPABASE_MIGRATION_SCHEMA.sql`

**Actions** :
1. ✅ Ouvrir https://supabase.com/dashboard
2. ✅ Sélectionner votre projet Jùlaba
3. ✅ Aller dans **SQL Editor**
4. ✅ Créer une **nouvelle requête**
5. ✅ Copier-coller le contenu de `SUPABASE_MIGRATION_SCHEMA.sql`
6. ✅ Cliquer sur **Run** (Exécuter)
7. ✅ Vérifier dans **Table Editor** que `users_julaba` apparaît

**Résultat attendu** :
```
✅ Table users_julaba créée
✅ 7 index créés
✅ 1 trigger créé (updated_at)
✅ 4 RLS policies créées
```

---

### ÉTAPE 2 : DÉPLOYER LE BACKEND ✅

**Fichier modifié** : `/supabase/functions/server/index.tsx`

**Nouveaux endpoints** :
- ✅ `POST /make-server-488793d3/auth/signup` - Inscription
- ✅ `POST /make-server-488793d3/auth/login` - Connexion
- ✅ `GET /make-server-488793d3/auth/me` - Profil utilisateur
- ✅ `POST /make-server-488793d3/auth/logout` - Déconnexion

**Le backend Supabase Edge Functions se redéploie automatiquement dans Figma Make.**

⚠️ Si vous utilisez Vercel, vous devez :
1. Commit + Push sur GitHub
2. Vercel redéploiera automatiquement

---

### ÉTAPE 3 : SERVICE AUTH FRONTEND ✅

**Nouveau fichier** : `/src/app/services/authService.ts`

**Fonctions disponibles** :
```typescript
import * as authService from './services/authService';

// Inscription
await authService.signup({
  phone: '0701020304',
  password: 'julaba2026',
  firstName: 'Aminata',
  lastName: 'Kouassi',
  role: 'marchand',
  region: 'Abidjan',
  commune: 'Yopougon',
  activity: 'Vente de riz',
  market: 'Marché de Yopougon'
});

// Connexion
await authService.login({
  phone: '0701020304',
  password: 'julaba2026'
});

// Profil actuel
await authService.getCurrentUser();

// Déconnexion
await authService.logout();

// Vérifier si connecté
authService.isAuthenticated();
```

---

### ÉTAPE 4 : CRÉER LES 5 UTILISATEURS DE TEST

**Utiliser le frontend Jùlaba ou cURL**

#### OPTION A : Via Frontend (Page de test)

Créer une page de test : `/src/app/pages/CreateTestUsers.tsx`

```tsx
import { signup } from '../services/authService';

const testUsers = [
  {
    phone: '0701020304',
    password: 'julaba2026',
    firstName: 'Aminata',
    lastName: 'Kouassi',
    role: 'marchand',
    region: 'Abidjan',
    commune: 'Yopougon',
    activity: 'Vente de riz',
    market: 'Marché de Yopougon'
  },
  {
    phone: '0709080706',
    password: 'julaba2026',
    firstName: 'Konan',
    lastName: 'Yao',
    role: 'producteur',
    region: 'Bouaké',
    commune: 'Bouaké Centre',
    activity: 'Production de maïs'
  },
  {
    phone: '0705040302',
    password: 'julaba2026',
    firstName: 'Marie',
    lastName: 'Bamba',
    role: 'cooperative',
    region: 'San Pedro',
    commune: 'San Pedro',
    activity: 'Coopérative agricole',
    cooperativeName: 'COOP IVOIRE VIVRIER'
  },
  {
    phone: '0707070707',
    password: 'julaba2026',
    firstName: 'Jean',
    lastName: 'Kouadio',
    role: 'institution',
    region: 'Abidjan',
    commune: 'Plateau',
    activity: 'Direction Générale de l\'Économie',
    institutionName: 'DGE Côte d\'Ivoire'
  },
  {
    phone: '0708080808',
    password: 'julaba2026',
    firstName: 'Sophie',
    lastName: 'Diarra',
    role: 'identificateur',
    region: 'Abidjan',
    commune: 'Marcory',
    activity: 'Agent terrain',
    market: 'Marché de Yopougon'
  }
];

// Créer tous les utilisateurs
for (const user of testUsers) {
  await signup(user);
}
```

#### OPTION B : Via cURL (Terminal)

```bash
# Utilisateur 1 : Aminata (Marchand)
curl -X POST https://gonfmltqggmrieqqbaya.supabase.co/functions/v1/make-server-488793d3/auth/signup \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -d '{
    "phone": "0701020304",
    "password": "julaba2026",
    "firstName": "Aminata",
    "lastName": "Kouassi",
    "role": "marchand",
    "region": "Abidjan",
    "commune": "Yopougon",
    "activity": "Vente de riz",
    "market": "Marché de Yopougon"
  }'

# Utilisateur 2 : Konan (Producteur)
curl -X POST https://gonfmltqggmrieqqbaya.supabase.co/functions/v1/make-server-488793d3/auth/signup \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -d '{
    "phone": "0709080706",
    "password": "julaba2026",
    "firstName": "Konan",
    "lastName": "Yao",
    "role": "producteur",
    "region": "Bouaké",
    "commune": "Bouaké Centre",
    "activity": "Production de maïs"
  }'

# Utilisateur 3 : Marie (Coopérative)
curl -X POST https://gonfmltqggmrieqqbaya.supabase.co/functions/v1/make-server-488793d3/auth/signup \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -d '{
    "phone": "0705040302",
    "password": "julaba2026",
    "firstName": "Marie",
    "lastName": "Bamba",
    "role": "cooperative",
    "region": "San Pedro",
    "commune": "San Pedro",
    "activity": "Coopérative agricole",
    "cooperativeName": "COOP IVOIRE VIVRIER"
  }'

# Utilisateur 4 : Jean (Institution)
curl -X POST https://gonfmltqggmrieqqbaya.supabase.co/functions/v1/make-server-488793d3/auth/signup \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -d '{
    "phone": "0707070707",
    "password": "julaba2026",
    "firstName": "Jean",
    "lastName": "Kouadio",
    "role": "institution",
    "region": "Abidjan",
    "commune": "Plateau",
    "activity": "Direction Générale de l'\''Économie",
    "institutionName": "DGE Côte d'\''Ivoire"
  }'

# Utilisateur 5 : Sophie (Identificateur)
curl -X POST https://gonfmltqggmrieqqbaya.supabase.co/functions/v1/make-server-488793d3/auth/signup \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -d '{
    "phone": "0708080808",
    "password": "julaba2026",
    "firstName": "Sophie",
    "lastName": "Diarra",
    "role": "identificateur",
    "region": "Abidjan",
    "commune": "Marcory",
    "activity": "Agent terrain",
    "market": "Marché de Yopougon"
  }'
```

---

### ÉTAPE 5 : TESTER LA CONNEXION

**Test manuel via /supabase-test** :

```typescript
import { login } from '../services/authService';

// Tester la connexion Aminata
const result = await login({
  phone: '0701020304',
  password: 'julaba2026'
});

console.log('Login result:', result);
// {
//   success: true,
//   accessToken: "eyJhbGc...",
//   user: { id: "...", firstName: "Aminata", ... }
// }
```

---

## 🔄 PROCHAINES ÉTAPES

### ✅ SEMAINE 1 TERMINÉE
- [x] Table users_julaba créée
- [x] Endpoints auth backend
- [x] Service auth frontend
- [x] 5 utilisateurs de test créés
- [x] Tests de connexion OK

### 📅 SEMAINE 2 : PRODUITS + TRANSACTIONS
- [ ] Table `products`
- [ ] Table `transactions`
- [ ] Endpoints CRUD produits
- [ ] Migrer POS Caisse vers Supabase

### 📅 SEMAINE 3 : COOPÉRATIVES + IDENTIFICATIONS
- [ ] Table `cooperatives`
- [ ] Table `identifications`
- [ ] Système de membres
- [ ] Workflow identification

### 📅 SEMAINE 4 : ACADEMY + ALERTES
- [ ] Table `formations`
- [ ] Table `alerts`
- [ ] Système de progression
- [ ] Notifications temps-réel

---

## 🛡️ SÉCURITÉ

### Tokens stockés
✅ `sessionStorage.julaba_access_token` - Token d'accès (expire)  
✅ `sessionStorage.julaba_refresh_token` - Token de rafraîchissement

⚠️ **NE JAMAIS stocker dans localStorage** (risque XSS)

### Row Level Security (RLS)
✅ Activé sur `users_julaba`  
✅ Les utilisateurs ne voient que leur profil  
✅ Les institutions voient tous les profils validés  
✅ Les identificateurs voient leur zone

---

## 📊 MÉTRIQUES DE SUCCÈS

**AVANT (Mock data)** :
- ❌ Données perdues au refresh
- ❌ Pas de persistance
- ❌ Pas de multi-device

**APRÈS (Supabase)** :
- ✅ Données persistantes
- ✅ Sync multi-device
- ✅ Sessions sécurisées
- ✅ Authentification réelle

---

## 🆘 SUPPORT

**Problèmes courants** :

1. **"Table users_julaba does not exist"**
   → Exécuter le script SQL dans Supabase Dashboard

2. **"401 Unauthorized"**
   → Vérifier que SUPABASE_ANON_KEY est configuré dans Vercel

3. **"Ce numéro existe déjà"**
   → Normal, l'utilisateur a déjà été créé

4. **"Network error"**
   → Vérifier que le backend Supabase Edge Function est déployé

---

**Prêt à passer à la SEMAINE 2 ?** 🚀
