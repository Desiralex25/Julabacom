# 🎤 Intégration ElevenLabs pour Tantie Sagesse

## Vue d'ensemble

Tantie Sagesse utilise **ElevenLabs** pour une synthèse vocale de qualité professionnelle en français, avec un **fallback automatique** vers l'API Web Speech du navigateur si ElevenLabs est indisponible.

---

## 📋 Configuration requise

### 1. Clé API ElevenLabs

#### Obtenir la clé :
1. Créez un compte sur [ElevenLabs](https://elevenlabs.io/)
2. Allez dans **Profile Settings** → **API Keys**
3. Créez une nouvelle clé avec les permissions :
   - ✅ **Text to Speech** (Accès)
   - ✅ **Génération de voix** (Accès)
   - ✅ **Modèles** (Accès)
   - ⚠️ **Voix** (Lire - optionnel)
   - ⚠️ **Historique** (Lire - optionnel)

#### Ajouter la clé dans Supabase :

**Via Dashboard :**
1. Allez sur votre projet Supabase : `https://supabase.com/dashboard/project/gsinfmhgagnrreqqbaya`
2. **Project Settings** → **Edge Functions** → **Secrets**
3. Ajoutez :
   - **Nom** : `ELEVENLABS_API_KEY`
   - **Valeur** : Votre clé API ElevenLabs

**Via CLI :**
```bash
# Installer le CLI Supabase
npm install -g supabase

# Se connecter
supabase login

# Lier votre projet
supabase link --project-ref gsinfmhgagnrreqqbaya

# Ajouter le secret
supabase secrets set ELEVENLABS_API_KEY=votre_clé_ici
```

---

## 🏗️ Architecture

### Backend (Supabase Edge Functions)

**Fichier : `/supabase/functions/server/index.tsx`**

#### Routes disponibles :

1. **POST** `/make-server-488793d3/tts/speak`
   - Génère l'audio via ElevenLabs
   - Body : `{ text: string, voiceId?: string }`
   - Retourne : `{ success: true, audio: base64, contentType: 'audio/mpeg' }`

2. **GET** `/make-server-488793d3/tts/voices`
   - Liste toutes les voix ElevenLabs disponibles
   - Retourne : `{ success: true, voices: Voice[] }`

### Frontend (React)

**Service : `/src/app/services/elevenlabs.ts`**

#### Fonctions principales :

```typescript
// Synthèse vocale avec ElevenLabs
await speak(text: string, voiceId?: string, onStart?, onEnd?, onError?)

// Fallback vers Web Speech API
speakWithWebSpeech(text: string, onStart?, onEnd?, onError?)

// Fonction intelligente avec fallback automatique
await speakWithFallback(text: string, useElevenLabs: boolean, voiceId?: string)

// Arrêter toute lecture en cours
stopSpeaking()

// Lister les voix disponibles
await getAvailableVoices()

// Effacer le cache audio
clearAudioCache()
```

#### Voix recommandées :

```typescript
import { RECOMMENDED_VOICES } from '../services/elevenlabs';

RECOMMENDED_VOICES.CHARLOTTE  // 🎯 Par défaut (voix féminine française)
RECOMMENDED_VOICES.GRACE      // Alternative féminine
RECOMMENDED_VOICES.MATILDA    // Alternative féminine
RECOMMENDED_VOICES.ADAM       // Voix masculine
```

---

## 🎯 Utilisation

### Dans AppContext (déjà intégré)

Le contexte global utilise automatiquement ElevenLabs :

```typescript
import { useApp } from './contexts/AppContext';

function MonComposant() {
  const { speak, voiceEnabled, setVoiceEnabled } = useApp();

  const handleClick = () => {
    speak('Bonjour, je suis Tantie Sagesse');
  };

  return (
    <button onClick={handleClick}>
      Parler
    </button>
  );
}
```

### Utilisation directe du service

```typescript
import * as ElevenLabs from '../services/elevenlabs';

// Simple
await ElevenLabs.speakWithFallback(
  'Votre transaction est validée',
  true, // Utiliser ElevenLabs si possible
  ElevenLabs.RECOMMENDED_VOICES.CHARLOTTE
);

// Avec gestion des événements
await ElevenLabs.speak(
  'Votre score est de 150 points',
  ElevenLabs.RECOMMENDED_VOICES.CHARLOTTE,
  () => console.log('Audio démarré'),
  () => console.log('Audio terminé'),
  (error) => console.error('Erreur:', error)
);
```

---

## 🧪 Test de l'intégration

### Composant de test automatique

En **mode développement**, un panneau de test apparaît automatiquement en bas à droite de l'écran :

**Fichier : `/src/app/components/TantieSagesseTest.tsx`**

Fonctionnalités :
- ✅ Test ElevenLabs
- ✅ Test Web Speech API
- ✅ Sélection de voix
- ✅ Texte personnalisé
- ✅ Affichage des erreurs
- ✅ Statut en temps réel

### Tests manuels via console

```javascript
// Dans la console du navigateur
import * as ElevenLabs from './services/elevenlabs';

// Test rapide
await ElevenLabs.speakWithFallback('Test de Tantie Sagesse', true);

// Lister les voix
const voices = await ElevenLabs.getAvailableVoices();
console.log(voices);

// Tester une voix spécifique
await ElevenLabs.speak('Test voix Charlotte', 'XB0fDUnXU5powFXDhCwa');
```

---

## 🔄 Fallback automatique

Le système gère intelligemment le fallback :

1. **Connexion en ligne + ElevenLabs activé**
   → Utilise ElevenLabs (qualité premium)

2. **Hors ligne OU ElevenLabs échoue**
   → Utilise automatiquement Web Speech API (navigateur natif)

3. **Web Speech API indisponible**
   → Pas de synthèse vocale (mode silencieux)

```typescript
// Le fallback est automatique dans AppContext
const speak = (text: string) => {
  if (!voiceEnabled) return;
  
  // ElevenLabs avec fallback automatique vers Web Speech
  ElevenLabs.speakWithFallback(
    text,
    isOnline, // N'utilise ElevenLabs que si en ligne
    RECOMMENDED_VOICES.CHARLOTTE
  );
};
```

---

## 🎨 Personnalisation des voix

### Modifier la voix par défaut

**Dans `/src/app/contexts/AppContext.tsx` :**

```typescript
speak('Votre message');
// Utilise automatiquement RECOMMENDED_VOICES.CHARLOTTE
```

Pour changer la voix par défaut :

```typescript
ElevenLabs.speakWithFallback(
  text,
  isOnline,
  ElevenLabs.RECOMMENDED_VOICES.GRACE // Ou une autre voix
);
```

### Ajouter de nouvelles voix

1. Listez les voix disponibles :
```typescript
const voices = await ElevenLabs.getAvailableVoices();
console.log(voices);
```

2. Ajoutez le voice_id dans `RECOMMENDED_VOICES` :
```typescript
// Dans /src/app/services/elevenlabs.ts
export const RECOMMENDED_VOICES = {
  CHARLOTTE: 'XB0fDUnXU5powFXDhCwa',
  NOUVELLE_VOIX: 'nouveau_voice_id_ici',
} as const;
```

---

## 🛠️ Déploiement

### Étapes pour la production

1. **Ajouter la clé API dans Supabase Dashboard**
   ```
   Nom : ELEVENLABS_API_KEY
   Valeur : votre_clé_production
   ```

2. **Déployer les Edge Functions**
   ```bash
   supabase functions deploy
   ```

3. **Vérifier le déploiement**
   ```bash
   curl https://gsinfmhgagnrreqqbaya.supabase.co/functions/v1/make-server-488793d3/tts/voices \
     -H "Authorization: Bearer YOUR_ANON_KEY"
   ```

4. **Tester en production sur Vercel**
   - Ouvrir https://julabacom.vercel.app/
   - Vérifier que Tantie Sagesse fonctionne
   - Regarder la console pour les logs

---

## 📊 Optimisations

### Cache audio

Le service met automatiquement en cache les audios générés :

```typescript
// Limite : 50 audios en cache
// Clé : `${voiceId}_${texte}`
// Effacer manuellement : clearAudioCache()
```

### Gestion de la file d'attente

Un seul audio joue à la fois :
- Nouvel appel → arrête l'audio en cours
- Évite les chevauchements
- Libère automatiquement les ressources

---

## 🐛 Débogage

### Problèmes courants

#### 1. "Service de synthèse vocale non configuré"
✅ **Solution** : Vérifier que `ELEVENLABS_API_KEY` est bien dans Supabase Secrets

```bash
supabase secrets list
```

#### 2. "ElevenLabs API returned 401"
✅ **Solution** : Clé API invalide ou expirée
- Vérifier les permissions sur ElevenLabs Dashboard
- Régénérer une nouvelle clé si nécessaire

#### 3. "Erreur lors de la lecture audio"
✅ **Solution** : Vérifier :
- Connexion internet
- Format audio supporté (audio/mpeg)
- Autorisations audio du navigateur

#### 4. Pas de son mais pas d'erreur
✅ **Solution** :
- Vérifier `voiceEnabled` dans AppContext
- Vérifier le volume du système
- Regarder la console pour les logs

### Logs utiles

```typescript
// Activer les logs détaillés
console.log('ElevenLabs TTS request', { text, voiceId });
console.log('Audio cache size:', audioCache.size);
console.log('Current audio element:', currentAudioElement);
```

---

## 💰 Coûts ElevenLabs

- **Plan gratuit** : 10 000 caractères/mois
- **Starter** : 30 000 caractères/mois (~$5)
- **Creator** : 100 000 caractères/mois (~$22)

### Estimation pour Jùlaba :
- Message moyen : ~50 caractères
- 10 000 caractères = ~200 messages vocaux
- Plan gratuit suffisant pour MVP/tests

---

## 🔐 Sécurité

### ✅ Bonnes pratiques appliquées

1. **Clé API côté serveur uniquement**
   - Jamais exposée au frontend
   - Stockée dans Supabase Secrets
   - Accessible uniquement par Edge Functions

2. **Validation des entrées**
   - Texte requis et non vide
   - Limite de longueur (implicite via ElevenLabs)

3. **Gestion des erreurs**
   - Tous les appels API sont try/catch
   - Logs détaillés côté serveur
   - Messages d'erreur clairs côté client

---

## 📚 Ressources

- [Documentation ElevenLabs](https://docs.elevenlabs.io/)
- [Supabase Edge Functions](https://supabase.com/docs/guides/functions)
- [Web Speech API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API)

---

## ✅ Checklist de déploiement

- [ ] Clé API ElevenLabs créée
- [ ] Permissions correctes activées
- [ ] Clé ajoutée dans Supabase Secrets
- [ ] Edge Functions déployées
- [ ] Tests en développement réussis
- [ ] Tests en production réussis
- [ ] Fallback Web Speech fonctionne
- [ ] Cache audio optimisé
- [ ] Logs de monitoring en place

---

**Intégration complète - Prêt pour production** 🚀
