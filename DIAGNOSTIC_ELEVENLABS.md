# 🔧 DIAGNOSTIC ELEVENLABS - Synthèse vocale du navigateur au lieu d'ElevenLabs

## 🎯 PROBLÈME

Vous avez configuré ElevenLabs mais Tantie Sagesse utilise toujours la synthèse vocale native du navigateur.

---

## 🔍 CAUSES POSSIBLES

### **Cause 1 : Clé API ElevenLabs non configurée**

La variable d'environnement `ELEVENLABS_API_KEY` n'est pas définie dans Supabase Edge Functions.

### **Cause 2 : Clé API invalide ou expirée**

La clé API existe mais n'est plus valide.

### **Cause 3 : Free Tier ElevenLabs bloqué**

Votre compte gratuit a été désactivé pour "activité inhabituelle" (erreur 401).

### **Cause 4 : Quota dépassé**

Vous avez atteint la limite de caractères gratuits (10,000/mois).

---

## ✅ SOLUTION 1 : UTILISER LA PAGE DE DIAGNOSTIC

### **Étape 1 : Accéder à la page de test**

Ouvrez dans votre navigateur :

```
http://localhost:5173/test-elevenlabs
```

Ou en production :

```
https://julabacom.vercel.app/test-elevenlabs
```

### **Étape 2 : Exécuter les tests dans l'ordre**

1. **Test Backend Health** → Vérifie que Supabase fonctionne
2. **Test Backend Direct** → Appelle directement `/tts/speak`
3. **Test Liste Voix** → Récupère les voix disponibles
4. **Test ElevenLabs TTS** → Génère et joue l'audio

### **Étape 3 : Analyser les résultats**

#### **✅ Si tout est vert**
ElevenLabs fonctionne correctement !

#### **❌ Si erreur 401**
```json
{
  "error": "Erreur lors de la génération audio",
  "details": "ElevenLabs API returned 401",
  "message": "unusual activity detected"
}
```

**Solution** : Votre compte Free Tier est bloqué → Passez à la Solution 2

#### **❌ Si erreur 503**
```json
{
  "error": "Service de synthèse vocale non configuré",
  "details": "ELEVENLABS_API_KEY manquante"
}
```

**Solution** : La clé API n'est pas définie → Passez à la Solution 3

---

## ✅ SOLUTION 2 : DÉBLOQUER / UPGRADER ELEVENLABS

### **Option A : Vérifier l'état du compte (Gratuit)**

1. **Connectez-vous** à https://elevenlabs.io
2. **Vérifiez** : Dashboard → Usage
3. **Regardez** si vous avez :
   - ❌ "Unusual activity detected"
   - ❌ "Free tier disabled"
   - ✅ Caractères restants : X / 10,000

### **Option B : Upgrader vers un plan payant (Recommandé)**

**Prix** : $5/mois (Starter) ou $11/mois (Creator)

**Avantages** :
- ✅ 30,000 caractères/mois (Starter) ou 100,000 (Creator)
- ✅ Voix plus naturelles
- ✅ Pas de blocage "unusual activity"
- ✅ Support prioritaire

**Comment upgrader** :
1. Aller sur https://elevenlabs.io/subscription
2. Choisir un plan
3. Ajouter un mode de paiement
4. Activer immédiatement

### **Option C : Créer un nouveau compte (Temporaire)**

**⚠️ Attention** : Cette méthode peut déclencher à nouveau le blocage.

1. Créer un nouveau compte ElevenLabs
2. Générer une nouvelle clé API
3. Remplacer l'ancienne clé dans Supabase (voir Solution 3)

---

## ✅ SOLUTION 3 : CONFIGURER LA CLÉ API ELEVENLABS DANS SUPABASE

### **Étape 1 : Récupérer votre clé API ElevenLabs**

1. Aller sur https://elevenlabs.io/app/settings/api-keys
2. Copier votre clé API (commence par `sk_...`)

### **Étape 2 : Ajouter la clé dans Supabase**

#### **Via Supabase Dashboard**

1. Aller sur https://supabase.com/dashboard
2. Sélectionner votre projet Jùlaba
3. Cliquer sur **"Edge Functions"** (menu gauche)
4. Cliquer sur **"Manage secrets"** ou **"Secrets"**
5. Ajouter un nouveau secret :
   - **Nom** : `ELEVENLABS_API_KEY`
   - **Valeur** : Votre clé API (ex: `sk_abc123...`)
6. Cliquer sur **"Save"**

#### **Via CLI Supabase (Alternative)**

```bash
# Se connecter à Supabase
npx supabase login

# Définir le secret
npx supabase secrets set ELEVENLABS_API_KEY=sk_votre_cle_api_ici
```

### **Étape 3 : Redéployer les Edge Functions**

Les Edge Functions doivent être redéployées pour utiliser le nouveau secret :

```bash
# Si vous utilisez Supabase CLI
npx supabase functions deploy
```

**Ou via Dashboard** :
1. Aller dans **Edge Functions**
2. Cliquer sur la fonction `make-server-488793d3`
3. Cliquer sur **"Redeploy"**

### **Étape 4 : Tester**

Retournez sur `/test-elevenlabs` et exécutez les tests.

---

## ✅ SOLUTION 4 : UTILISER LE FALLBACK WEB SPEECH API (MODE DÉGRADÉ)

Si vous voulez continuer avec la synthèse vocale native du navigateur (gratuite, illimitée) :

### **Modifier les appels dans votre code**

```typescript
// AVANT (ElevenLabs uniquement)
await speak(text, voiceId, onStart, onEnd, onError);

// APRÈS (Avec fallback automatique)
await speakWithFallback(text, true, voiceId);
```

**Ou désactiver ElevenLabs complètement** :

```typescript
await speakWithFallback(text, false); // false = utiliser Web Speech API directement
```

---

## 📊 TABLEAU COMPARATIF

| Critère | ElevenLabs | Web Speech API |
|---------|-----------|----------------|
| **Qualité vocale** | ⭐⭐⭐⭐⭐ Très naturelle | ⭐⭐⭐ Robotique |
| **Prix** | $5-11/mois ou 10k gratuit | Gratuit illimité |
| **Langues** | +29 langues | Dépend du navigateur |
| **Personnalisation** | Voix custom possibles | Voix système |
| **Offline** | ❌ Nécessite internet | ✅ Fonctionne offline |
| **Configuration** | Clé API requise | Aucune config |
| **Production** | ✅ Recommandé | ⚠️ Basique |

---

## 🔧 VÉRIFICATION RAPIDE

### **Test 1 : La clé API est-elle configurée ?**

```bash
# Depuis le terminal
curl -X GET "https://VOTRE_PROJECT_ID.supabase.co/functions/v1/make-server-488793d3/tts/voices" \
  -H "Authorization: Bearer VOTRE_ANON_KEY"
```

**Résultat attendu si clé configurée** :
```json
{
  "success": true,
  "voices": [...]
}
```

**Résultat si clé manquante** :
```json
{
  "success": false,
  "error": "Service de synthèse vocale non configuré"
}
```

### **Test 2 : ElevenLabs fonctionne-t-il ?**

Depuis la console du navigateur :

```javascript
const response = await fetch('https://api.elevenlabs.io/v1/voices', {
  headers: {
    'xi-api-key': 'VOTRE_CLE_API'
  }
});
console.log(await response.json());
```

---

## 🚨 ERREURS COURANTES

### **Erreur 1 : "ELEVENLABS_API_KEY manquante"**

```
error: "Service de synthèse vocale non configuré"
details: "ELEVENLABS_API_KEY manquante"
```

**Solution** : Ajouter la clé dans Supabase Secrets (voir Solution 3)

---

### **Erreur 2 : "Unusual activity detected"**

```
{
  "detail": {
    "status": "detected_unusual_activity",
    "message": "Free Tier usage disabled..."
  }
}
```

**Solution** : Upgrader vers un plan payant (voir Solution 2, Option B)

---

### **Erreur 3 : "Quota exceeded"**

```
{
  "detail": {
    "status": "quota_exceeded",
    "message": "You have exceeded your character quota"
  }
}
```

**Solution** : 
- Attendre le renouvellement mensuel (gratuit)
- Ou upgrader vers un plan payant

---

### **Erreur 4 : "Invalid API key"**

```
{
  "detail": {
    "status": "invalid_api_key"
  }
}
```

**Solution** : 
- Vérifier que la clé API est correcte
- Régénérer une nouvelle clé sur https://elevenlabs.io/app/settings/api-keys

---

## 🎯 RECOMMANDATIONS FINALES

### **Pour le développement**
- ✅ Utiliser Web Speech API (gratuit, simple)
- ✅ Ou compte ElevenLabs Free Tier (10k caractères/mois)

### **Pour la production**
- ✅ **Recommandé** : ElevenLabs Starter ($5/mois) minimum
- ✅ Voix africaines disponibles
- ✅ Expérience utilisateur premium

### **Configuration hybride (Meilleur des deux mondes)**

```typescript
// Utiliser ElevenLabs si disponible, sinon fallback
const useElevenLabs = Deno.env.get('DENO_ENV') === 'production';
await speakWithFallback(text, useElevenLabs);
```

---

## 📞 BESOIN D'AIDE ?

1. **Testez** d'abord avec `/test-elevenlabs`
2. **Vérifiez** les logs du navigateur (F12 → Console)
3. **Vérifiez** les logs Supabase Edge Functions
4. **Consultez** la documentation ElevenLabs : https://docs.elevenlabs.io

---

**Dernière mise à jour** : 5 mars 2026  
**Fichiers modifiés** : 
- `/src/app/services/elevenlabs.ts`
- `/src/app/pages/TestElevenLabs.tsx`
- `/src/app/routes.tsx`
