# 📱 CONFIGURATION WASSOYA SMS - JÙLABA

**Date** : 5 mars 2026  
**Statut** : Prêt pour production - Configuration requise

---

## ✅ IMPLÉMENTATION TERMINÉE

L'intégration Wassoya est **100% terminée** selon la documentation officielle :

### **Documentation Wassoya utilisée**
- **Endpoint** : `POST /sms/messages`
- **Paramètres** :
  - ✅ `from` : Nom de l'expéditeur (11 caractères max)
  - ✅ `to` : Numéro du destinataire (format international : 2250700000000)
  - ✅ `content` : Contenu du message (160 caractères max)
  - ✅ `notifyUrl` : URL de callback (optionnel - non utilisé pour l'instant)

### **Fichiers modifiés**
1. ✅ `/supabase/functions/server/sms.ts` - Service SMS Wassoya conforme à la doc
2. ✅ `/supabase/functions/server/index.tsx` - Route `/auth/send-otp` utilise le service SMS

---

## 🔐 CONFIGURATION REQUISE DANS SUPABASE

Pour activer l'envoi de vrais SMS en production, vous devez configurer **3 secrets** dans Supabase Edge Functions.

### **Étape 1 : Accéder à Supabase Dashboard**

1. Allez sur https://supabase.com/dashboard
2. Sélectionnez votre projet : **gonfmltqggmrieqqbaya**
3. Dans le menu latéral gauche, cliquez sur **Edge Functions**
4. Cliquez sur **Settings** (ou l'icône ⚙️)

### **Étape 2 : Ajouter les 3 secrets Wassoya**

Dans la section **Secrets** ou **Environment Variables**, ajoutez :

#### **Secret 1 : WASSOYA_API_KEY**
```
Nom : WASSOYA_API_KEY
Valeur : Votre clé API Wassoya (obtenue sur wassoya.com)
```

#### **Secret 2 : WASSOYA_API_URL**
```
Nom : WASSOYA_API_URL
Valeur : https://api.wassoya.com/sms/messages
```

**⚠️ IMPORTANT** : L'URL doit être exactement `/sms/messages` selon la documentation Wassoya.

#### **Secret 3 : WASSOYA_SENDER_ID**
```
Nom : WASSOYA_SENDER_ID
Valeur : JULABA
```

**⚠️ ATTENTION** : 
- Maximum **11 caractères**
- Pas d'espaces
- Lettres et chiffres uniquement
- Exemples valides : `JULABA`, `JulabaApp`, `Julaba2026`

---

## 🚀 ÉTAPE 3 : REDÉPLOYER LES EDGE FUNCTIONS

Une fois les secrets ajoutés, vous devez **OBLIGATOIREMENT** redéployer les Edge Functions.

### **Option A : Via Supabase CLI (Recommandé)**

```bash
# 1. Installer Supabase CLI si ce n'est pas fait
npm install -g supabase

# 2. Se connecter
supabase login

# 3. Lier votre projet
supabase link --project-ref gonfmltqggmrieqqbaya

# 4. Déployer les fonctions
supabase functions deploy make-server-488793d3

# 5. Vérifier le déploiement
supabase functions list
```

### **Option B : Via Supabase Dashboard**

1. Allez dans **Edge Functions** > **make-server-488793d3**
2. Cliquez sur **Deploy** ou **Redeploy**
3. Attendez la fin du déploiement (quelques secondes)

---

## 🧪 TESTER L'ENVOI DE SMS

### **Test 1 : Via l'application Jùlaba**

1. Allez sur https://julabacom.vercel.app/
2. Entrez votre numéro de téléphone (ex: **0701020304**)
3. Cliquez sur **"Recevoir le code"**
4. Vous devriez recevoir un SMS avec le code OTP

### **Test 2 : Via curl (manuel)**

```bash
curl -X POST https://gonfmltqggmrieqqbaya.supabase.co/functions/v1/make-server-488793d3/auth/send-otp \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdvbmZtbHRxZ2dtcmllcXFiYXlhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI2Njk3NjQsImV4cCI6MjA4ODI0NTc2NH0.N38kxGKxja0tPTYD2ZOEK6-M4wtFQJ5TJ0uttXGAlAk" \
  -d '{"phone":"0701020304"}'
```

**Réponse attendue** :
```json
{
  "success": true,
  "message": "Code OTP envoyé avec succès",
  "smsDelivered": true
}
```

Si `smsDelivered: false`, vérifiez les logs Supabase.

### **Test 3 : Vérifier les logs Supabase**

1. Allez dans **Edge Functions** > **make-server-488793d3**
2. Cliquez sur **Logs**
3. Recherchez :
   - ✅ `✅ SMS envoyé avec succès à 0701020304 via Wassoya`
   - ❌ `⚠️ Erreur envoi SMS Wassoya: ...`

---

## 📋 DÉTAILS TECHNIQUES DE L'IMPLÉMENTATION

### **Format des numéros selon Wassoya**

Le service convertit automatiquement les numéros au format Wassoya :

| Format entré | Format envoyé à Wassoya |
|--------------|-------------------------|
| `0701020304` | `2250701020304` |
| `+2250701020304` | `2250701020304` |
| `2250701020304` | `2250701020304` |

### **Validation automatique**

Le service valide :
- ✅ Numéro au format 225 + 10 chiffres
- ✅ Sender ID max 11 caractères
- ✅ Message max 160 caractères (tronqué si dépassement)

### **Exemple de SMS envoyé**

```
Votre code Jùlaba : 1234
Valide 10 minutes.
Ne partagez jamais ce code.
```

**Longueur** : 68 caractères (bien en dessous de la limite de 160)

---

## 🔍 DÉPANNAGE

### **Problème : "Service SMS non configuré"**

**Cause** : `WASSOYA_API_KEY` manquante  
**Solution** : Ajoutez le secret dans Supabase et redéployez

### **Problème : "Sender ID trop long"**

**Cause** : `WASSOYA_SENDER_ID` > 11 caractères  
**Solution** : Utilisez un nom court (ex: `JULABA` = 6 caractères)

### **Problème : "Numéro invalide"**

**Cause** : Format de numéro non reconnu  
**Solution** : Vérifiez que le numéro est bien ivoirien (commence par 0, +225 ou 225)

### **Problème : SMS non reçu**

**Solutions** :
1. Vérifiez les logs Supabase pour voir si le SMS a été envoyé
2. Vérifiez votre solde SMS sur wassoya.com
3. Vérifiez que le numéro destinataire est valide
4. Testez avec un autre numéro

### **Problème : "Erreur HTTP 401" de Wassoya**

**Cause** : API Key invalide ou expirée  
**Solution** : Vérifiez votre clé API sur wassoya.com et mettez à jour le secret

### **Problème : "Erreur HTTP 403" de Wassoya**

**Cause** : Sender ID non autorisé  
**Solution** : Vérifiez sur wassoya.com que votre Sender ID est approuvé

---

## 📊 MONITORING EN PRODUCTION

### **Logs à surveiller**

Dans les logs Supabase Edge Functions, recherchez :

✅ **Succès** :
```
📱 Envoi SMS via Wassoya à 2250701020304: "Votre code Jùlaba : 1234..."
✅ SMS envoyé avec succès via Wassoya: { messageId: "msg_001" }
```

❌ **Erreurs** :
```
❌ WASSOYA_API_KEY non configurée
❌ Numéro invalide après formatage: 12345
❌ Erreur HTTP 401 de Wassoya: {"error": "Invalid API key"}
```

### **Métriques à suivre**

1. **Taux de livraison SMS** : `smsDelivered: true/false`
2. **Temps de réponse Wassoya** : Visible dans les logs
3. **Erreurs d'authentification** : HTTP 401/403
4. **Numéros invalides** : Vérifier les validations

---

## ✅ CHECKLIST DE MISE EN PRODUCTION

Avant de considérer le système SMS comme opérationnel :

- [ ] Les 3 secrets Wassoya sont configurés dans Supabase
- [ ] Les Edge Functions sont redéployées
- [ ] Un test d'envoi SMS a réussi avec `smsDelivered: true`
- [ ] Le SMS a été reçu sur un vrai téléphone
- [ ] Les logs Supabase montrent `✅ SMS envoyé avec succès`
- [ ] Le solde SMS Wassoya est suffisant
- [ ] Le Sender ID est approuvé par Wassoya

---

## 🎯 PROCHAINES AMÉLIORATIONS (Optionnel)

### **1. Webhook de notification (notifyUrl)**

Wassoya peut notifier votre app quand le SMS est délivré :

```typescript
// Dans /supabase/functions/server/sms.ts
body: JSON.stringify({
  from: senderId,
  to: formattedPhone,
  content: message,
  notifyUrl: 'https://gonfmltqggmrieqqbaya.supabase.co/functions/v1/make-server-488793d3/webhooks/sms-status'
})
```

Puis créer la route `/webhooks/sms-status` pour recevoir les statuts.

### **2. Système de retry**

Si l'envoi échoue, réessayer automatiquement :

```typescript
let retries = 3;
while (retries > 0) {
  const result = await sendSMS(phone, message);
  if (result.success) break;
  retries--;
  await new Promise(r => setTimeout(r, 2000)); // Attendre 2s
}
```

### **3. Rate limiting**

Limiter le nombre d'OTP par numéro (ex: 3 par heure) :

```typescript
const rateLimitKey = `ratelimit:otp:${phone}`;
const attempts = await kv.get(rateLimitKey) || 0;
if (attempts >= 3) {
  return c.json({ error: 'Trop de tentatives. Réessayez dans 1 heure' }, 429);
}
```

---

## 📞 SUPPORT WASSOYA

Si vous rencontrez des problèmes avec l'API Wassoya :

- **Site web** : https://wassoya.com
- **Documentation** : https://wassoya.com/docs
- **Support** : Contactez le support Wassoya via leur dashboard

---

**Configuration terminée avec succès !** 🎉

Une fois les secrets configurés et les fonctions redéployées, le système OTP SMS Jùlaba sera 100% opérationnel en production.
