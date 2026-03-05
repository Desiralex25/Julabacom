# Guide d'activation ElevenLabs pour Tantie Sagesse

## État actuel

✅ **Frontend** : Service ElevenLabs configuré avec fallback Web Speech API  
✅ **Backend** : Routes `/tts/speak` et `/tts/voices` créées  
✅ **Déploiement** : Edge Functions déployées sur Supabase  
⚠️ **Manquant** : Clé API ELEVENLABS_API_KEY dans les Secrets Supabase

---

## Étapes pour activer ElevenLabs

### 1️⃣ Obtenir une clé API ElevenLabs

1. Allez sur [elevenlabs.io](https://elevenlabs.io)
2. Créez un compte gratuit (10 000 caractères/mois gratuits)
3. Allez dans **Profile Settings** → **API Key**
4. Copiez votre clé API (commence par `sk_...`)

### 2️⃣ Ajouter la clé dans Supabase

1. Allez sur [supabase.com/dashboard](https://supabase.com/dashboard)
2. Sélectionnez votre projet Jùlaba
3. Dans le menu latéral : **Edge Functions** → **Secrets**
4. Cliquez sur **Add new secret**
5. Nom : `ELEVENLABS_API_KEY`
6. Valeur : Collez votre clé API
7. Cliquez sur **Save**

### 3️⃣ Redéployer les Edge Functions

```bash
# Dans votre terminal
supabase functions deploy make-server-488793d3
```

Ou attendez simplement 1-2 minutes, Supabase redéploiera automatiquement.

### 4️⃣ Tester

1. Ouvrez votre application Jùlaba
2. Vous devriez voir le **panneau de test Tantie Sagesse** en bas à droite
3. Cliquez sur **"Test ElevenLabs"**
4. Vous devriez entendre la voix française de Charlotte

---

## Diagnostic des erreurs

### ❌ Erreur : "Service de synthèse vocale non configuré"

**Cause** : La clé `ELEVENLABS_API_KEY` n'est pas dans les Secrets Supabase  
**Solution** : Suivez l'étape 2️⃣ ci-dessus

### ❌ Erreur : "Unauthorized" ou "Invalid API key"

**Cause** : La clé API est incorrecte ou expirée  
**Solution** : Générez une nouvelle clé sur elevenlabs.io

### ❌ Erreur : "Quota exceeded"

**Cause** : Vous avez dépassé les 10 000 caractères gratuits ce mois-ci  
**Solution** : Attendez le mois prochain ou passez à un plan payant

### ✅ Fallback automatique

Si ElevenLabs ne fonctionne pas, le système basculera automatiquement sur **Web Speech API** (voix du navigateur). Aucune action requise.

---

## Vérification dans les logs

Ouvrez la console du navigateur (F12) et cherchez :

```
✅ Bon signe :
- "Fetching voices from: https://..."
- "X voix récupérées avec succès"
- "ElevenLabs API response status: 200"

❌ Problème :
- "ELEVENLABS_API_KEY missing"
- "Voices API error:"
- "Get voices error:"
```

---

## Voix recommandées

Par défaut, Tantie Sagesse utilise **Charlotte** (voix française féminine).

Autres voix disponibles :
- **Grace** : Voix féminine douce
- **Matilda** : Voix féminine anglaise
- **Adam** : Voix masculine

Vous pouvez tester différentes voix dans le panneau de test.

---

## Support

Si vous rencontrez des problèmes, vérifiez :
1. Les logs dans la console (F12)
2. Les logs Supabase Edge Functions
3. Que la clé API est bien enregistrée dans Supabase

---

**Dernière mise à jour** : Mars 2026
