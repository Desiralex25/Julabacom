# ✅ Checklist de Test - Back-Office JÙLABA

## 🧪 Tests à Effectuer en Production

### **Test 1 : Création du Super Admin**

**URL** : `https://julabacom.vercel.app/create-super-admin`

**Actions :**
- [ ] La page s'affiche correctement
- [ ] Le logo JÙLABA est visible
- [ ] Le warning "Usage Unique" est affiché
- [ ] Le formulaire contient tous les champs :
  - [ ] Téléphone (préfixe +225 fixe)
  - [ ] Prénom
  - [ ] Nom
  - [ ] Mot de passe
- [ ] La validation fonctionne :
  - [ ] Téléphone doit avoir 10 chiffres
  - [ ] Mot de passe minimum 8 caractères
  - [ ] Tous les champs sont requis

**Test de création :**
- [ ] Remplir avec données valides :
  ```
  Téléphone : 0700000001
  Prénom : Test
  Nom : SuperAdmin
  Mot de passe : TestSecure123
  ```
- [ ] Cliquer sur "Créer le Super Admin"
- [ ] Vérifier le spinner de chargement
- [ ] Vérifier le message de succès
- [ ] Vérifier que les infos affichées sont correctes
- [ ] Cliquer sur "Se connecter maintenant"
- [ ] Vérifier la redirection vers `/backoffice/login`

**Test de sécurité :**
- [ ] Essayer de créer un 2ème Super Admin
- [ ] Vérifier le message d'erreur "Un compte Super Admin existe déjà"

---

### **Test 2 : Connexion au Back-Office**

**URL** : `https://julabacom.vercel.app/backoffice/login`

**Vérifications visuelles :**
- [ ] La page affiche `LoginPassword.tsx` (pas `BOLogin.tsx`)
- [ ] Le logo JÙLABA blanc est visible
- [ ] Le formulaire contient :
  - [ ] Input téléphone avec préfixe +225
  - [ ] Input mot de passe avec toggle show/hide
  - [ ] Bouton "Continuer"
  - [ ] Lien "Mot de passe oublié"

**Test connexion valide :**
- [ ] Entrer le téléphone créé : `0700000001`
- [ ] Entrer le mot de passe : `TestSecure123`
- [ ] Cliquer sur "Continuer"
- [ ] Vérifier le spinner de chargement
- [ ] Vérifier le message vocal/texte de Tantie Sagesse
- [ ] Vérifier la redirection vers `/backoffice/dashboard`
- [ ] Vérifier que l'utilisateur est connecté

**Test connexion invalide :**
- [ ] Essayer avec un mauvais mot de passe
- [ ] Vérifier le message d'erreur "Identifiants incorrects"
- [ ] Vérifier le compteur "X tentatives restantes"
- [ ] Essayer 5 fois de suite
- [ ] Vérifier le message "Compte bloqué"
- [ ] Attendre 30 secondes et vérifier que c'est toujours bloqué

**Test téléphone invalide :**
- [ ] Essayer avec un téléphone non enregistré
- [ ] Vérifier le message d'erreur approprié

---

### **Test 3 : Dashboard Back-Office**

**URL** : Après connexion → `/backoffice/dashboard`

**Vérifications :**
- [ ] Le dashboard s'affiche correctement
- [ ] L'utilisateur connecté est affiché en haut
- [ ] Les statistiques sont visibles
- [ ] Le menu latéral contient les 14 modules :
  - [ ] 📊 Dashboard
  - [ ] 👥 Acteurs
  - [ ] 🏢 Institutions
  - [ ] 📝 Enrôlement
  - [ ] 🔍 Supervision
  - [ ] 🗺️ Zones
  - [ ] 💰 Commissions
  - [ ] 🎓 Academy
  - [ ] 🎯 Missions
  - [ ] 📊 Rapports
  - [ ] 🔔 Notifications
  - [ ] 🛡️ Audit
  - [ ] 👤 Profil
  - [ ] ⚙️ Paramètres

**Test navigation :**
- [ ] Cliquer sur chaque module
- [ ] Vérifier qu'ils se chargent correctement
- [ ] Vérifier qu'il n'y a pas d'erreurs console

---

### **Test 4 : Système de Tokens**

**Ouvrir la Console du Navigateur :**

```javascript
// Vérifier les tokens stockés
console.log('Access Token:', localStorage.getItem('julaba_access_token'));
console.log('Refresh Token:', localStorage.getItem('julaba_refresh_token'));
```

**Vérifications :**
- [ ] Les tokens sont bien stockés
- [ ] Ils sont au format JWT (3 parties séparées par des points)
- [ ] Ils contiennent les bonnes données

**Décoder le token (facultatif) :**

```javascript
// Copier le access_token et aller sur https://jwt.io/
// Vérifier que le payload contient :
{
  "sub": "uuid-de-l-utilisateur",
  "email": "0700000001@julaba.local",
  "role": "authenticated",
  // ...
}
```

---

### **Test 5 : Backend API**

**Test de la route de création :**

```bash
curl -X POST https://rzefrbv.supabase.co/functions/v1/make-server-488793d3/auth/create-super-admin \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer [SUPABASE_ANON_KEY]" \
  -d '{
    "phone": "0700000002",
    "password": "Test123456",
    "firstName": "Test2",
    "lastName": "Admin2"
  }'
```

**Résultat attendu :**
```json
{
  "error": "Un compte Super Admin existe déjà",
  "message": "Pour des raisons de sécurité, un seul Super Admin initial peut être créé via cette route"
}
```

**Test de la route de login :**

```bash
curl -X POST https://rzefrbv.supabase.co/functions/v1/make-server-488793d3/auth/login \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer [SUPABASE_ANON_KEY]" \
  -d '{
    "phone": "0700000001",
    "password": "TestSecure123"
  }'
```

**Résultat attendu :**
```json
{
  "success": true,
  "accessToken": "eyJhbGc...",
  "refreshToken": "eyJhbGc...",
  "user": {
    "id": "uuid",
    "phone": "0700000001",
    "firstName": "Test",
    "lastName": "SuperAdmin",
    "role": "super_admin",
    ...
  }
}
```

---

### **Test 6 : Vérification Base de Données**

**Via Supabase Dashboard :**

1. Aller sur https://supabase.com/dashboard
2. Sélectionner le projet JÙLABA
3. Aller dans "Table Editor"
4. Ouvrir la table `users_julaba`

**Vérifications :**
- [ ] Une ligne existe pour le Super Admin créé
- [ ] Les champs sont corrects :
  - [ ] `phone` = "0700000001"
  - [ ] `first_name` = "Test"
  - [ ] `last_name` = "SuperAdmin"
  - [ ] `role` = "super_admin"
  - [ ] `validated` = true
  - [ ] `verified_phone` = true
  - [ ] `institution_name` = "JÙLABA Back-Office"
  - [ ] `score` = 100

5. Aller dans "Authentication" > "Users"

**Vérifications :**
- [ ] Un utilisateur existe avec email "0700000001@julaba.local"
- [ ] Le statut est "Confirmed"
- [ ] Les user_metadata contiennent les bonnes infos

---

### **Test 7 : Redirection par Rôle**

**Créer des comptes de test pour chaque rôle :**

| Rôle          | Téléphone    | Redirection Attendue      |
|---------------|-------------|---------------------------|
| super_admin   | 0700000001  | /backoffice/dashboard     |
| identificateur| 0700000002  | /identificateur           |
| marchand      | 0700000003  | /marchand                 |
| producteur    | 0700000004  | /producteur               |
| cooperative   | 0700000005  | /cooperative              |
| institution   | 0700000006  | /institution              |

**Pour chaque rôle :**
- [ ] Se connecter
- [ ] Vérifier la redirection correcte
- [ ] Se déconnecter

---

### **Test 8 : Mot de Passe Oublié**

**Depuis la page de connexion :**
- [ ] Cliquer sur "Mot de passe oublié ?"
- [ ] Vérifier que le modal/page s'affiche
- [ ] Entrer le téléphone : `0700000001`
- [ ] Vérifier le message affiché
- [ ] Vérifier les instructions

---

### **Test 9 : Déconnexion**

**Depuis le Back-Office :**
- [ ] Cliquer sur le profil en haut à droite
- [ ] Cliquer sur "Déconnexion"
- [ ] Vérifier la redirection vers `/login`
- [ ] Vérifier que les tokens sont supprimés :
  ```javascript
  console.log(localStorage.getItem('julaba_access_token')); // null
  ```

---

### **Test 10 : Protection des Routes**

**Sans être connecté :**
- [ ] Essayer d'accéder à `/backoffice/dashboard`
- [ ] Vérifier la redirection vers `/login`

**Connecté comme marchand :**
- [ ] Essayer d'accéder à `/backoffice/dashboard`
- [ ] Vérifier qu'on est bloqué ou redirigé

---

## 🐛 Bugs Potentiels à Surveiller

### **Frontend**

- [ ] Erreur "BOLogin is not defined" → BOLogin.tsx bien supprimé ?
- [ ] Redirection infinie → Vérifier les routes
- [ ] Tokens non sauvegardés → Vérifier localStorage
- [ ] Tantie Sagesse ne parle pas → Permissions navigateur

### **Backend**

- [ ] Erreur 500 "Internal Server Error" → Vérifier logs Supabase
- [ ] Erreur CORS → Vérifier configuration Hono
- [ ] Erreur "User not found" → Vérifier table users_julaba
- [ ] Erreur "Invalid token" → Vérifier génération JWT

### **Base de Données**

- [ ] Erreur "duplicate key value" → Un utilisateur existe déjà
- [ ] Erreur "foreign key constraint" → Lien auth_user_id cassé
- [ ] Erreur "permission denied" → Vérifier RLS Supabase

---

## 📊 Rapport de Test

**Date :** _____________  
**Testeur :** _____________  
**Environnement :** Production (julabacom.vercel.app)

### Résultats :

| Test | Status | Notes |
|------|--------|-------|
| Test 1 : Création Super Admin | ⬜ OK / ⬜ KO | |
| Test 2 : Connexion Back-Office | ⬜ OK / ⬜ KO | |
| Test 3 : Dashboard | ⬜ OK / ⬜ KO | |
| Test 4 : Tokens | ⬜ OK / ⬜ KO | |
| Test 5 : Backend API | ⬜ OK / ⬜ KO | |
| Test 6 : Base de Données | ⬜ OK / ⬜ KO | |
| Test 7 : Redirections | ⬜ OK / ⬜ KO | |
| Test 8 : Mot de passe oublié | ⬜ OK / ⬜ KO | |
| Test 9 : Déconnexion | ⬜ OK / ⬜ KO | |
| Test 10 : Protection routes | ⬜ OK / ⬜ KO | |

### Bugs trouvés :
```
1. 
2. 
3. 
```

### Recommandations :
```
1. 
2. 
3. 
```

---

**Signature :** _____________  
**Date :** _____________
