# ⚡ GUIDE EXPRESS : CONFIGURER LES SECRETS WASSOYA

**Temps requis** : 5 minutes  
**Difficulté** : Facile

---

## 🎯 OBJECTIF

Activer l'envoi de **vrais SMS** via Wassoya pour les codes OTP Jùlaba.

---

## 📝 CE DONT VOUS AVEZ BESOIN

Avant de commencer, obtenez ces informations de Wassoya :

1. ✅ **Votre clé API Wassoya** (obtenue sur https://wassoya.com après inscription)
2. ✅ **Votre Sender ID approuvé** (ex: `JULABA`)

---

## 🚀 ÉTAPES (5 MINUTES)

### **ÉTAPE 1 : Accéder à Supabase Dashboard**

1. Allez sur : https://supabase.com/dashboard/projects
2. Cliquez sur votre projet : **gonfmltqggmrieqqbaya**

### **ÉTAPE 2 : Aller dans Edge Functions Settings**

1. Dans le menu latéral gauche, cherchez **Edge Functions**
2. Cliquez sur **Edge Functions**
3. Vous verrez la fonction **make-server-488793d3**
4. Cliquez sur **Settings** (icône ⚙️ en haut à droite) OU sur l'onglet **Secrets**

### **ÉTAPE 3 : Ajouter les 3 secrets**

Cliquez sur **"Add secret"** ou **"New secret"** et ajoutez ces 3 secrets un par un :

#### **Secret 1/3**
```
Name: WASSOYA_API_KEY
Value: [Votre clé API Wassoya]
```
Cliquez sur **Save** ou **Add**

#### **Secret 2/3**
```
Name: WASSOYA_API_URL
Value: https://api.wassoya.com/sms/messages
```
Cliquez sur **Save** ou **Add**

#### **Secret 3/3**
```
Name: WASSOYA_SENDER_ID
Value: JULABA
```
⚠️ **Maximum 11 caractères !**  
Cliquez sur **Save** ou **Add**

### **ÉTAPE 4 : Redéployer les Edge Functions**

**Option A - Via le Dashboard** (Recommandé si vous n'avez pas Supabase CLI)
1. Retournez dans **Edge Functions**
2. Cliquez sur **make-server-488793d3**
3. Cliquez sur **Deploy** ou **Redeploy**
4. Attendez le succès du déploiement (icône ✅ verte)

**Option B - Via CLI** (Si vous avez Supabase CLI installé)
```bash
supabase login
supabase link --project-ref gonfmltqggmrieqqbaya
supabase functions deploy make-server-488793d3
```

### **ÉTAPE 5 : Tester**

1. Allez sur https://julabacom.vercel.app/
2. Entrez un vrai numéro ivoirien (ex: **0701020304**)
3. Cliquez sur **"Recevoir le code"**
4. **Vous devriez recevoir un SMS dans les 10 secondes !** 📱

---

## ✅ VÉRIFICATION

### **Comment savoir si ça marche ?**

**Test 1 : Via l'application**
- Le SMS arrive sur votre téléphone ✅
- Le message affiche : `"Code envoyé par SMS"`

**Test 2 : Via les logs Supabase**
1. Allez dans **Edge Functions** > **make-server-488793d3** > **Logs**
2. Cherchez cette ligne :
   ```
   ✅ SMS envoyé avec succès à 0701020304 via Wassoya
   ```

**Test 3 : Via l'API (pour développeurs)**
```bash
curl -X POST https://gonfmltqggmrieqqbaya.supabase.co/functions/v1/make-server-488793d3/auth/send-otp \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdvbmZtbHRxZ2dtcmllcXFiYXlhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI2Njk3NjQsImV4cCI6MjA4ODI0NTc2NH0.N38kxGKxja0tPTYD2ZOEK6-M4wtFQJ5TJ0uttXGAlAk" \
  -d '{"phone":"0701020304"}'
```

Si vous voyez `"smsDelivered": true`, c'est **PARFAIT** ! ✅

---

## ❌ DÉPANNAGE EXPRESS

### **"Service SMS non configuré"**
→ Les secrets ne sont pas configurés OU vous n'avez pas redéployé  
→ Solution : Vérifiez l'étape 3 et refaites l'étape 4

### **"Sender ID trop long"**
→ Votre WASSOYA_SENDER_ID fait plus de 11 caractères  
→ Solution : Utilisez `JULABA` (6 caractères) au lieu d'un nom plus long

### **SMS non reçu mais "smsDelivered: true"**
→ Le SMS a été envoyé par Wassoya mais pas encore délivré (peut prendre 1-2 minutes)  
→ Solution : Attendez quelques minutes OU vérifiez votre solde SMS sur wassoya.com

### **"Erreur HTTP 401"**
→ Votre clé API Wassoya est invalide  
→ Solution : Vérifiez la clé sur https://wassoya.com/dashboard et mettez à jour le secret

---

## 🎯 RÉCAPITULATIF VISUEL

```
┌─────────────────────────────────────────────┐
│  1. Supabase Dashboard                      │
│     ↓                                       │
│  2. Edge Functions > Settings > Secrets    │
│     ↓                                       │
│  3. Add 3 secrets:                          │
│     - WASSOYA_API_KEY                       │
│     - WASSOYA_API_URL                       │
│     - WASSOYA_SENDER_ID                     │
│     ↓                                       │
│  4. Redeploy Edge Functions                 │
│     ↓                                       │
│  5. Tester sur julabacom.vercel.app         │
│     ↓                                       │
│  ✅ SMS REÇU !                              │
└─────────────────────────────────────────────┘
```

---

## 📋 CHECKLIST FINALE

Avant de fermer ce guide :

- [ ] J'ai ajouté les 3 secrets dans Supabase Edge Functions Settings
- [ ] J'ai redéployé les Edge Functions
- [ ] J'ai testé avec mon numéro et reçu le SMS
- [ ] Les logs Supabase montrent "✅ SMS envoyé avec succès"

**Si tous les points sont cochés, FÉLICITATIONS !** 🎉  
Le système OTP SMS Jùlaba est maintenant 100% opérationnel en production.

---

## 🆘 BESOIN D'AIDE ?

Si vous êtes bloqué :

1. **Vérifiez les logs Supabase** : Edge Functions > make-server-488793d3 > Logs
2. **Consultez la documentation complète** : `/WASSOYA_CONFIGURATION.md`
3. **Vérifiez votre compte Wassoya** : https://wassoya.com/dashboard

---

**Bonne configuration !** 🚀
