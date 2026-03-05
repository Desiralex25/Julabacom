# 📱 WASSOYA SMS - JÙLABA

**Système d'envoi de SMS OTP via Wassoya.com**

---

## 🎯 VUE D'ENSEMBLE

L'intégration Wassoya permet à Jùlaba d'envoyer des **codes OTP par SMS** pour l'authentification des utilisateurs via leur numéro de téléphone.

### **Statut actuel**
- ✅ **Code backend** : 100% conforme à la documentation Wassoya
- ⚠️ **Configuration** : Secrets Wassoya à ajouter dans Supabase
- ⏳ **Tests** : À effectuer après configuration

---

## 📚 DOCUMENTATION

Selon votre besoin, consultez l'un de ces guides :

### **🚀 Guide Express (5 minutes)**
→ `/GUIDE_RAPIDE_SECRETS_WASSOYA.md`

Pour configurer rapidement les secrets Wassoya dans Supabase et activer l'envoi de SMS.

### **📋 Configuration complète**
→ `/WASSOYA_CONFIGURATION.md`

Documentation détaillée avec :
- Explications techniques
- Tests de validation
- Dépannage avancé
- Monitoring en production

### **📊 État de l'intégration**
→ `/ETAT_INTEGRATION_WASSOYA.md`

Audit complet montrant :
- Conformité avec la doc Wassoya
- Comparaison avant/après correction
- Checklist de validation

---

## ⚡ DÉMARRAGE RAPIDE

### **1. Prérequis**

Obtenez ces informations sur https://wassoya.com :

- **Clé API Wassoya** (obtenue après inscription)
- **Sender ID approuvé** (ex: `JULABA`, max 11 caractères)

### **2. Configuration (3 étapes)**

#### **Étape 1 : Ajouter les secrets dans Supabase**

1. Allez sur https://supabase.com/dashboard
2. Projet : **gonfmltqggmrieqqbaya**
3. Edge Functions → Settings → Secrets
4. Ajoutez ces 3 secrets :

```
WASSOYA_API_KEY      = [Votre clé API]
WASSOYA_API_URL      = https://api.wassoya.com/sms/messages
WASSOYA_SENDER_ID    = JULABA
```

#### **Étape 2 : Redéployer**

```bash
supabase functions deploy make-server-488793d3
```

#### **Étape 3 : Tester**

```bash
./test-wassoya-integration.sh 0701020304
```

Ou testez directement sur : https://julabacom.vercel.app/

---

## 🧪 TESTER L'INTÉGRATION

### **Option 1 : Script de test automatique**

```bash
chmod +x test-wassoya-integration.sh
./test-wassoya-integration.sh 0701020304
```

Le script teste :
- ✅ Connexion au backend
- ✅ Génération du code OTP
- ✅ Envoi du SMS via Wassoya
- ✅ Réception du SMS

### **Option 2 : Test manuel via curl**

```bash
curl -X POST https://gonfmltqggmrieqqbaya.supabase.co/functions/v1/make-server-488793d3/auth/send-otp \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdvbmZtbHRxZ2dtcmllcXFiYXlhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI2Njk3NjQsImV4cCI6MjA4ODI0NTc2NH0.N38kxGKxja0tPTYD2ZOEK6-M4wtFQJ5TJ0uttXGAlAk" \
  -d '{"phone":"0701020304"}'
```

**Réponse attendue :**
```json
{
  "success": true,
  "message": "Code OTP envoyé avec succès",
  "smsDelivered": true
}
```

### **Option 3 : Via l'application web**

1. Allez sur https://julabacom.vercel.app/
2. Entrez un numéro ivoirien (ex: 0701020304)
3. Cliquez sur "Recevoir le code"
4. Vérifiez votre téléphone

---

## 🔍 VÉRIFICATION

### **✅ Succès**

Si vous voyez ceci dans les logs Supabase :

```
📱 Envoi SMS via Wassoya à 2250701020304: "Votre code Jùlaba : 1234..."
✅ SMS envoyé avec succès via Wassoya: { messageId: "msg_001" }
```

Et que vous recevez ce SMS :

```
Votre code Jùlaba : 1234
Valide 10 minutes.
Ne partagez jamais ce code.
```

**→ L'intégration est 100% opérationnelle !** 🎉

### **❌ Échec**

Si vous voyez :

```
❌ WASSOYA_API_KEY non configurée
```

→ Les secrets ne sont pas configurés. Voir `/GUIDE_RAPIDE_SECRETS_WASSOYA.md`

Si vous voyez :

```
❌ Erreur HTTP 401 de Wassoya
```

→ Clé API invalide. Vérifiez sur https://wassoya.com/dashboard

---

## 📊 ARCHITECTURE

```
┌─────────────────┐
│  Application    │  Utilisateur entre son numéro
│  Jùlaba Web     │  Ex: 0701020304
└────────┬────────┘
         │ POST /auth/send-otp
         ▼
┌─────────────────┐
│  Supabase Edge  │  1. Génère code OTP (1234)
│  Functions      │  2. Stocke dans KV (expire 10 min)
│  (Hono server)  │  3. Appelle service SMS
└────────┬────────┘
         │ POST /sms/messages
         ▼
┌─────────────────┐
│  API Wassoya    │  Envoie le SMS au numéro
│  wassoya.com    │  Format: 2250701020304
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  📱 Téléphone   │  Reçoit le SMS avec le code
│  Utilisateur    │  "Votre code Jùlaba : 1234..."
└─────────────────┘
```

---

## 🛠️ FICHIERS TECHNIQUES

### **Backend**

- `/supabase/functions/server/sms.ts` - Service d'envoi SMS Wassoya
- `/supabase/functions/server/index.tsx` - Routes OTP (`/auth/send-otp`, `/auth/verify-otp`)

### **Frontend**

- `/src/app/components/auth/Login.tsx` - Interface d'authentification avec OTP
- `/src/app/utils/api.ts` - Appels API vers le backend

### **Tests**

- `/test-wassoya-integration.sh` - Script de test automatique

---

## 🔐 SÉCURITÉ

### **Secrets protégés**

Les secrets suivants sont stockés dans Supabase Edge Functions (JAMAIS dans le code) :

- ✅ `WASSOYA_API_KEY` - Clé API secrète
- ✅ `WASSOYA_API_URL` - URL de l'API
- ✅ `WASSOYA_SENDER_ID` - Nom de l'expéditeur

### **Validations implémentées**

- ✅ Code OTP de 4 chiffres aléatoire
- ✅ Expiration après 10 minutes
- ✅ Maximum 3 tentatives de vérification
- ✅ Numéro de téléphone au format ivoirien
- ✅ Message SMS limité à 160 caractères

### **Format des numéros**

Tous les formats sont acceptés en entrée :

| Format entré | Format envoyé à Wassoya |
|--------------|-------------------------|
| `0701020304` | `2250701020304` |
| `+2250701020304` | `2250701020304` |
| `2250701020304` | `2250701020304` |

---

## 📈 MONITORING

### **Métriques à suivre**

1. **Taux de livraison SMS** : `smsDelivered: true/false` dans la réponse API
2. **Erreurs d'envoi** : Logs Supabase avec `❌ Erreur envoi SMS`
3. **Codes expirés** : Tentatives de vérification après 10 minutes
4. **Tentatives échouées** : Plus de 3 tentatives sur le même code

### **Logs Supabase**

Pour voir les logs :
1. Supabase Dashboard → Edge Functions
2. Cliquez sur **make-server-488793d3**
3. Onglet **Logs**

Recherchez :
- `📱 Envoi SMS via Wassoya` - Début du processus
- `✅ SMS envoyé avec succès` - Succès
- `❌ Erreur envoi SMS` - Échec

---

## 🐛 DÉPANNAGE

| Problème | Cause probable | Solution |
|----------|----------------|----------|
| "Service SMS non configuré" | Secrets manquants | Ajoutez les 3 secrets Wassoya |
| "Sender ID trop long" | Sender > 11 caractères | Utilisez `JULABA` (6 char) |
| "Numéro invalide" | Format non reconnu | Vérifiez le format ivoirien |
| SMS non reçu | Solde insuffisant / Numéro invalide | Vérifiez wassoya.com |
| "Erreur HTTP 401" | Clé API invalide | Vérifiez la clé sur wassoya.com |
| "Erreur HTTP 403" | Sender ID non approuvé | Faites approuver sur wassoya.com |

**Pour un dépannage complet** → `/WASSOYA_CONFIGURATION.md`

---

## ✅ CHECKLIST DE PRODUCTION

Avant de mettre en production :

- [ ] Les 3 secrets Wassoya sont configurés dans Supabase
- [ ] Les Edge Functions sont redéployées
- [ ] Un test d'envoi a réussi avec `smsDelivered: true`
- [ ] Le SMS a été reçu sur un vrai téléphone ivoirien
- [ ] Les logs Supabase montrent "✅ SMS envoyé avec succès"
- [ ] Le solde SMS Wassoya est suffisant
- [ ] Le Sender ID est approuvé par Wassoya

---

## 🆘 SUPPORT

### **Problème avec Jùlaba**
- Documentation : `/WASSOYA_CONFIGURATION.md`
- Tests : `./test-wassoya-integration.sh`
- Logs : Supabase Dashboard → Edge Functions → Logs

### **Problème avec Wassoya**
- Site : https://wassoya.com
- Documentation : https://wassoya.com/docs
- Support : Via dashboard Wassoya

---

## 📝 NOTES TECHNIQUES

### **Paramètres Wassoya**

Selon la documentation officielle :

```json
{
  "from": "JULABA",              // Max 11 caractères
  "to": "2250701020304",         // Format international sans +
  "content": "Votre code...",    // Max 160 caractères
  "notifyUrl": "https://..."     // Optionnel (non utilisé)
}
```

### **Message OTP envoyé**

```
Votre code Jùlaba : [CODE]
Valide 10 minutes.
Ne partagez jamais ce code.
```

**Longueur** : 73 caractères (✅ bien en dessous de 160)

### **Expiration et sécurité**

- Code valide : **10 minutes**
- Tentatives max : **3**
- Stockage : **KV Supabase** (clé `otp:{phone}`)
- Suppression : Automatique après expiration ou 3 échecs

---

## 🎯 PROCHAINES AMÉLIORATIONS (Optionnel)

1. **Webhook de statut** : Recevoir une notification quand le SMS est délivré
2. **Rate limiting** : Limiter à 3 OTP par heure par numéro
3. **Retry automatique** : Réessayer l'envoi en cas d'échec temporaire
4. **Métriques avancées** : Dashboard de suivi des envois SMS

---

## 📄 LICENCE

Ce code est privé et propriété de Jùlaba.

---

**Dernière mise à jour** : 5 mars 2026  
**Version** : 1.0.0  
**Statut** : Production-ready (après configuration secrets)

---

## 🚀 DÉMARRER MAINTENANT

```bash
# 1. Configurez les secrets (voir GUIDE_RAPIDE_SECRETS_WASSOYA.md)
# 2. Redéployez les fonctions
supabase functions deploy make-server-488793d3

# 3. Testez
./test-wassoya-integration.sh 0701020304

# 4. Si succès → Déployé en production ! 🎉
```

---

**Besoin d'aide ?** Consultez `/GUIDE_RAPIDE_SECRETS_WASSOYA.md` pour une configuration en 5 minutes.
