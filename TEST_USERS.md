# 👥 Utilisateurs de Test - Jùlaba OTP

## 📱 Comment tester la connexion OTP

### Mode Développement (Local)

1. **Lancez l'application :**
   ```bash
   npm run dev
   ```

2. **Testez avec n'importe quel numéro :**
   - Allez sur `http://localhost:5173/`
   - Entrez **n'importe quel numéro** à 10 chiffres (ex: `0101010101`)
   - Le code OTP s'affichera dans l'encadré bleu

3. **Comportement selon les cas :**

   **Cas 1 : Nouvel utilisateur**
   - Entrez : `0999999999`
   - Code OTP : Affiché dans l'interface
   - Résultat : Redirection vers `/onboarding`

   **Cas 2 : Utilisateur existant**
   - Entrez un numéro présent dans `users_julaba`
   - Code OTP : Affiché dans l'interface  
   - Résultat : Connexion → Dashboard selon le rôle

---

## 🧪 Créer des utilisateurs de test

### Option 1 : Via le Backend Office (Identificateur)

Si vous avez un compte identificateur ou super admin :

1. Connectez-vous au Back-Office
2. Allez dans **"Enrôlement"**
3. Créez un nouvel acteur avec :
   - Numéro : `0701020304`
   - Prénom : `Kouadio`
   - Nom : `Yao`
   - Rôle : `marchand`
   - Région : `Abidjan`
   - Commune : `Yopougon`
   - Activité : `vente_detail`

4. Testez la connexion avec `0701020304`

---

### Option 2 : Via l'API Supabase directement

**Étape 1 : Ajouter un utilisateur dans la table `users_julaba`**

```sql
INSERT INTO users_julaba (
  phone,
  first_name,
  last_name,
  role,
  region,
  commune,
  activity,
  validated,
  score,
  created_at
) VALUES (
  '0701020304',
  'Kouadio',
  'Yao',
  'marchand',
  'Abidjan',
  'Yopougon',
  'vente_detail',
  true,
  100,
  NOW()
);
```

**Étape 2 : Tester la connexion**

1. Allez sur `http://localhost:5173/`
2. Entrez : `0701020304`
3. Récupérez le code OTP (ex: `1234`)
4. Validez → Connexion réussie !

---

### Option 3 : Via la route `/auth/signup`

**Request :**
```bash
curl -X POST https://gonfmltqggmrieqqbaya.supabase.co/functions/v1/make-server-488793d3/auth/signup \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdvbmZtbHRxZ2dtcmllcXFiYXlhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI2Njk3NjQsImV4cCI6MjA4ODI0NTc2NH0.N38kxGKxja0tPTYD2ZOEK6-M4wtFQJ5TJ0uttXGAlAk" \
  -d '{
    "phone": "0701020304",
    "password": "0701020304",
    "firstName": "Kouadio",
    "lastName": "Yao",
    "role": "marchand",
    "region": "Abidjan",
    "commune": "Yopougon",
    "activity": "vente_detail"
  }'
```

---

## 🎭 Profils de Test Suggérés

### Marchand
```json
{
  "phone": "0701020304",
  "firstName": "Kouadio",
  "lastName": "Yao",
  "role": "marchand",
  "region": "Abidjan",
  "commune": "Yopougon",
  "activity": "vente_detail",
  "market": "Marché de Yopougon"
}
```

### Producteur
```json
{
  "phone": "0702030405",
  "firstName": "Adjoua",
  "lastName": "Koné",
  "role": "producteur",
  "region": "Bouaké",
  "commune": "Bouaké",
  "activity": "culture_igname"
}
```

### Coopérative
```json
{
  "phone": "0703040506",
  "firstName": "Amidou",
  "lastName": "Traoré",
  "role": "cooperative",
  "region": "Yamoussoukro",
  "commune": "Yamoussoukro",
  "activity": "cooperative",
  "cooperativeName": "Coopérative Ivoire Vivrier"
}
```

### Institution
```json
{
  "phone": "0704050607",
  "firstName": "Marie",
  "lastName": "Bamba",
  "role": "institution",
  "region": "Abidjan",
  "commune": "Plateau",
  "activity": "institution",
  "institutionName": "ANADER"
}
```

### Identificateur
```json
{
  "phone": "0705060708",
  "firstName": "Yao",
  "lastName": "N'Guessan",
  "role": "identificateur",
  "region": "Abidjan",
  "commune": "Marcory",
  "activity": "identification"
}
```

### Super Admin
```json
{
  "phone": "0700000000",
  "firstName": "Admin",
  "lastName": "Système",
  "role": "super_admin",
  "region": "Abidjan",
  "commune": "Plateau",
  "activity": "administration"
}
```

---

## 🔐 Codes OTP de Test

**En mode développement**, chaque fois que vous demandez un code :

1. Le code s'affiche dans **l'interface** (encadré bleu)
2. Le code est loggé dans la **console serveur** :
   ```
   📱 OTP pour 0701020304: 5678 (expire à ...)
   ```
3. Le code est dans la **réponse API** (onglet Réseau)

**Durée de validité :** 10 minutes

**Tentatives autorisées :** 3 essais maximum

---

## ✅ Scénarios de Test

### Test 1 : Connexion réussie (utilisateur existant)
1. Créez un utilisateur dans `users_julaba`
2. Entrez son numéro : `0701020304`
3. Récupérez le code OTP
4. Validez
5. ✅ Connexion → Redirection vers `/marchand`

### Test 2 : Nouvel utilisateur
1. Entrez un numéro non enregistré : `0999999999`
2. Récupérez le code OTP
3. Validez
4. ✅ Redirection vers `/onboarding`

### Test 3 : Code expiré
1. Demandez un code OTP
2. Attendez 11 minutes
3. Essayez de valider
4. ❌ "Code OTP expiré. Demandez un nouveau code."

### Test 4 : Code incorrect
1. Demandez un code OTP (ex: `1234`)
2. Entrez un mauvais code : `9999`
3. ❌ "Code OTP incorrect" (2 tentatives restantes)
4. Réessayez 2 fois de plus
5. ❌ "Trop de tentatives. Demandez un nouveau code."

### Test 5 : Numéro invalide
1. Entrez un numéro avec moins de 10 chiffres : `070102`
2. Cliquez sur "Continuer"
3. ❌ "Le numéro doit contenir 10 chiffres"

---

## 🚀 Tester sur Vercel (Production)

**URL Production :** `https://julabacom.vercel.app/`

**IMPORTANT :**
- En production, le code OTP ne s'affiche **PAS** dans l'interface
- Vous devez configurer Twilio pour recevoir de vrais SMS
- Ou consulter les logs serveur Supabase :
  ```bash
  supabase functions logs make-server-488793d3
  ```

---

## 📊 Monitoring

### Voir les OTP générés
```bash
# En développement
npm run dev
# → Logs dans le terminal Vite

# En production
supabase functions logs make-server-488793d3 --follow
```

### Voir les tentatives échouées
```bash
# Rechercher "Code OTP incorrect" dans les logs
supabase functions logs make-server-488793d3 | grep "incorrect"
```

---

## 🎉 Prêt à tester !

Le système OTP est 100% fonctionnel. Commencez par :

1. **Créer un utilisateur de test** (Option 1, 2 ou 3)
2. **Tester la connexion** avec son numéro
3. **Vérifier le code OTP** (affichage dans l'UI)
4. **Valider** et profiter de Jùlaba ! 🚀
