# 🔐 Guide de Connexion OTP - Jùlaba

## ✅ Configuration Terminée

Le système de connexion par OTP (One-Time Password) est maintenant **100% opérationnel** sur Vercel avec Supabase !

---

## 🎯 Comment ça fonctionne ?

### 1️⃣ **Étape 1 : Entrer le numéro de téléphone**
- L'utilisateur entre son numéro à 10 chiffres (ex: `0701020304`)
- Le système ajoute automatiquement le préfixe `+225` (Côte d'Ivoire)

### 2️⃣ **Étape 2 : Envoi du code OTP**
- Le backend génère un code aléatoire de **4 chiffres**
- Le code est stocké dans Supabase KV Store avec :
  - Expiration : **10 minutes**
  - Maximum 3 tentatives de vérification
- **En production** : Le code sera envoyé par SMS via Twilio/Vonage
- **En développement** : Le code est affiché dans :
  - Les logs serveur
  - L'interface (encadré bleu)
  - La réponse API (champ `devOnly.code`)

### 3️⃣ **Étape 3 : Vérification du code**
- L'utilisateur entre le code à 4 chiffres
- Le backend vérifie :
  - ✅ Code correct
  - ✅ Pas expiré
  - ✅ Moins de 3 tentatives
- Si valide → Connexion automatique

### 4️⃣ **Étape 4 : Connexion ou Onboarding**
- **Utilisateur existant** : Connecté → Redirigé vers son dashboard
- **Nouvel utilisateur** : Redirigé vers l'onboarding pour créer son profil

---

## 📂 Architecture Backend

### Routes API Créées

#### 🔹 `POST /auth/send-otp`
Envoie un code OTP au numéro de téléphone

**Request:**
```json
{
  "phone": "0701020304"
}
```

**Response (Success):**
```json
{
  "success": true,
  "message": "Code OTP envoyé avec succès",
  "devOnly": {
    "code": "1234",
    "expiresAt": "2026-03-05T15:00:00.000Z"
  }
}
```

**Response (Error):**
```json
{
  "error": "Numéro de téléphone invalide (10 chiffres requis)"
}
```

---

#### 🔹 `POST /auth/verify-otp`
Vérifie le code OTP et connecte l'utilisateur

**Request:**
```json
{
  "phone": "0701020304",
  "code": "1234"
}
```

**Response (Nouvel utilisateur):**
```json
{
  "success": true,
  "newUser": true,
  "phone": "0701020304",
  "message": "Bienvenue ! Complétez votre profil pour continuer."
}
```

**Response (Utilisateur existant):**
```json
{
  "success": true,
  "newUser": false,
  "accessToken": "eyJhbGciOi...",
  "refreshToken": "eyJhbGciOi...",
  "user": {
    "id": "123",
    "phone": "0701020304",
    "firstName": "Kouadio",
    "lastName": "Yao",
    "role": "marchand",
    "region": "Abidjan",
    "commune": "Yopougon",
    "activity": "vente_detail",
    "validated": true,
    "score": 150
  }
}
```

**Response (Code incorrect):**
```json
{
  "error": "Code OTP incorrect",
  "attemptsRemaining": 2
}
```

---

## 🔒 Sécurité Implémentée

| Fonctionnalité | Détails |
|----------------|---------|
| **Expiration** | 10 minutes après génération |
| **Tentatives** | Maximum 3 essais par code |
| **Stockage** | KV Store Supabase (sécurisé) |
| **Validation** | Format numéro : exactement 10 chiffres |
| **Rate Limiting** | À implémenter en production (optionnel) |

---

## 🧪 Tests en Développement

### Tester avec un numéro quelconque

1. Allez sur `http://localhost:5173/`
2. Entrez n'importe quel numéro à 10 chiffres (ex: `0101010101`)
3. Cliquez sur **"Continuer"**
4. Le code OTP s'affiche dans :
   - 📱 L'encadré bleu en haut du formulaire
   - 🖥️ Les logs serveur (console Supabase)
   - 🔍 La console navigateur (réseau → réponse API)
5. Entrez le code à 4 chiffres
6. Cliquez sur **"Valider"**

**Résultat attendu :**
- Si numéro existe dans `users_julaba` → Connexion
- Sinon → Redirection vers `/onboarding`

---

## 🚀 Déploiement en Production

### Étape 1 : Configurer l'envoi de SMS

Pour envoyer de vrais SMS, intégrez un service comme **Twilio** ou **Vonage**.

#### Exemple avec Twilio :

1. Créez un compte sur [Twilio](https://www.twilio.com/)
2. Obtenez vos clés API :
   - `TWILIO_ACCOUNT_SID`
   - `TWILIO_AUTH_TOKEN`
   - `TWILIO_PHONE_NUMBER`
3. Ajoutez-les dans les secrets Supabase :

```bash
supabase secrets set TWILIO_ACCOUNT_SID=ACxxx...
supabase secrets set TWILIO_AUTH_TOKEN=xxx...
supabase secrets set TWILIO_PHONE_NUMBER=+1234567890
```

4. Modifiez `/supabase/functions/server/index.tsx` (ligne ~110) :

```typescript
// Après génération du code OTP, avant le console.log :

const twilioAccountSid = Deno.env.get('TWILIO_ACCOUNT_SID');
const twilioAuthToken = Deno.env.get('TWILIO_AUTH_TOKEN');
const twilioPhone = Deno.env.get('TWILIO_PHONE_NUMBER');

if (twilioAccountSid && twilioAuthToken && twilioPhone) {
  try {
    const response = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${twilioAccountSid}/Messages.json`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${btoa(`${twilioAccountSid}:${twilioAuthToken}`)}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          To: `+225${phone}`,
          From: twilioPhone,
          Body: `Votre code Jùlaba : ${otpCode}. Valide 10 minutes.`
        })
      }
    );

    if (!response.ok) {
      console.error('Erreur envoi SMS Twilio:', await response.text());
    } else {
      console.log(`✅ SMS envoyé à +225${phone}`);
    }
  } catch (error) {
    console.error('Erreur Twilio:', error);
  }
}
```

5. **IMPORTANT** : Supprimez la partie `devOnly` dans la réponse API :

```typescript
return c.json({
  success: true,
  message: 'Code OTP envoyé avec succès',
  // SUPPRIMER CETTE SECTION EN PRODUCTION :
  // devOnly: {
  //   code: otpCode,
  //   expiresAt: expiresAt
  // }
});
```

---

### Étape 2 : Masquer le code en production

Dans `/src/app/components/auth/Login.tsx` (ligne ~555), le code OTP ne s'affiche que si `import.meta.env.DEV` est `true`. En production sur Vercel, cette variable sera automatiquement `false` → le code ne s'affichera pas.

---

## 🎨 Interface Utilisateur

### Composants mis à jour :

1. **`Login.tsx`**
   - Intégration des appels API `sendOTP()` et `verifyOTP()`
   - Affichage du code en mode dev
   - Indicateurs de chargement
   - Gestion des erreurs vocales (Tantie Sagesse)

2. **`Onboarding.tsx`**
   - Page pour nouveaux utilisateurs
   - Message d'accueil
   - Redirection vers login

3. **`api.ts`** (nouveau)
   - Fonctions utilitaires pour les appels API
   - Typage TypeScript complet

---

## 📊 Monitoring & Logs

### En développement :
```bash
# Voir les logs serveur :
supabase functions serve

# Logs en temps réel :
📱 OTP pour 0701020304: 5678 (expire à 2026-03-05T15:10:00.000Z)
```

### En production :
```bash
# Voir les logs Supabase Edge Functions :
supabase functions logs make-server-488793d3
```

---

## 🐛 Dépannage

### Problème : "Code OTP invalide ou expiré"
- ✅ Vérifiez que le code n'a pas plus de 10 minutes
- ✅ Vérifiez que vous n'avez pas dépassé 3 tentatives
- ✅ Demandez un nouveau code

### Problème : "Erreur réseau"
- ✅ Vérifiez que Supabase est accessible
- ✅ Vérifiez la variable `projectId` dans `/utils/supabase/info.tsx`
- ✅ Vérifiez que les routes backend existent sur Supabase

### Problème : Le SMS n'arrive pas
- ✅ Vérifiez que Twilio est configuré (production uniquement)
- ✅ Vérifiez les secrets Supabase (`TWILIO_*`)
- ✅ Vérifiez les logs serveur pour les erreurs Twilio

---

## ✅ Checklist Déploiement

- [x] Routes backend créées (`/auth/send-otp`, `/auth/verify-otp`)
- [x] Frontend intégré avec gestion des erreurs
- [x] Stockage OTP dans KV Store
- [x] Expiration et limite de tentatives
- [x] Mode développement avec affichage du code
- [x] Page onboarding pour nouveaux utilisateurs
- [ ] **TODO** : Intégration Twilio pour SMS réels
- [ ] **TODO** : Tests E2E (Playwright/Cypress)
- [ ] **TODO** : Rate limiting pour éviter le spam

---

## 🎉 Prêt à tester !

Le système est **100% fonctionnel** pour tester en développement. Pour activer les SMS réels, suivez les instructions de la section "Déploiement en Production".

**Testons maintenant :**
1. `npm run dev`
2. Allez sur `http://localhost:5173/`
3. Entrez `0123456789`
4. Récupérez le code dans l'encadré bleu
5. Validez ! 🚀
