# 🚀 Démarrage Rapide - Moteur d'Intention IA

## ⚡ En 3 minutes

### 1️⃣ Vérifier la configuration

```bash
# La clé OpenAI est déjà configurée ✅
# Vérifier dans Supabase Dashboard → Edge Functions → Secrets
# OPENAI_API_KEY doit être présente
```

### 2️⃣ Tester l'API directement

```bash
# Remplacer VOTRE_PROJET et VOTRE_ANON_KEY
curl -X POST https://VOTRE_PROJET.supabase.co/functions/v1/make-server-488793d3/ai/interpret \
  -H "Authorization: Bearer VOTRE_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Je veux vendre 200kg de cacao",
    "role": "marchand",
    "screen": "/marchand/dashboard"
  }'
```

### 3️⃣ Utiliser dans l'application

Ouvrir Tantie Sagesse et dire:
- "Je veux vendre 200kg de cacao"
- "Combien j'ai gagné aujourd'hui ?"
- "Ajouter 5 sacs de riz au panier"

**C'est tout ! 🎉**

---

## 🧪 Tester avec le composant de test

### Option A: Intégrer dans une page de dev

```tsx
import { AIIntentTester } from '@/components/dev/AIIntentTester';

export default function TestPage() {
  return <AIIntentTester />;
}
```

### Option B: Tester directement depuis TantieSagesseModal

1. Ouvrir n'importe quel profil (marchand, producteur, etc.)
2. Cliquer sur le bouton Tantie Sagesse
3. Écrire ou dire un message
4. Voir l'analyse en temps réel

---

## 📱 Utilisation finale utilisateur

### Scénario 1: Marchand qui veut vendre

**Action utilisateur:**
1. Ouvre Tantie Sagesse
2. Dit: "Je veux vendre 200kg de cacao"

**Système:**
1. ✅ Analyse le message avec GPT
2. ✅ Détecte: `create_order` (95% confiance)
3. ✅ Affiche: "Tu veux créer une vente de 200 kg de cacao..."
4. ✅ Bouton "Confirmer" apparaît
5. ✅ Redirige vers `/marchand/caisse`

### Scénario 2: Producteur qui déclare récolte

**Action utilisateur:**
1. Ouvre Tantie Sagesse
2. Dit: "Ma récolte de 3 tonnes de café est prête"

**Système:**
1. ✅ Détecte: `create_harvest`
2. ✅ Extrait: `product: "café", quantity: "3", unit: "tonne"`
3. ✅ Demande confirmation
4. ✅ Redirige vers `/producteur/recolte`

### Scénario 3: Question simple

**Action utilisateur:**
1. Dit: "Combien j'ai gagné aujourd'hui ?"

**Système:**
1. ✅ Détecte: `show_sales`
2. ✅ PAS de confirmation (action sûre)
3. ✅ Lit vocalement le montant
4. ✅ Affiche le dashboard

---

## 🔧 Personnalisation rapide

### Ajouter un nouveau message de test

Dans `AIIntentTester.tsx`:

```typescript
const TEST_MESSAGES = [
  // ... existants
  { role: 'marchand', message: 'Votre nouveau message de test' },
];
```

### Changer le modèle GPT

Dans `/supabase/functions/server/ai-intent.ts`:

```typescript
body: JSON.stringify({
  model: 'gpt-4o-mini', // ← Changer ici
  // ou 'gpt-4o' pour plus de puissance
  // ou 'gpt-3.5-turbo' pour moins cher
```

### Ajuster le ton de Tantie Sagesse

Dans `SYSTEM_PROMPT`:

```typescript
const SYSTEM_PROMPT = `Tu es Tantie Sagesse, une assistante IA...
Ton ton est maternel, patient et encourageant.
Utilise des expressions ivoiriennes quand approprié. // ← Personnaliser ici
```

---

## 📊 Vérifier que ça fonctionne

### Checklist

- [ ] Secret `OPENAI_API_KEY` configuré dans Supabase
- [ ] Route `/ai/interpret` accessible
- [ ] TantieSagesseModal charge sans erreur
- [ ] Message envoyé → réponse IA reçue
- [ ] Logs visible dans console: `🤖 AI Intent - User: ...`
- [ ] Navigation fonctionne après confirmation

### Logs attendus

**Backend (Supabase Edge Functions):**
```
🤖 AI Intent - User: uuid | Role: marchand | Screen: /dashboard | Message: "Je veux vendre 200kg"
✅ AI Intent détecté: create_order (confidence: 0.95)
```

**Frontend (Console navigateur):**
```
🤖 [AI Intent] Analyse du message: Je veux vendre 200kg de cacao
✅ [AI Intent] Intention détectée: create_order
📊 Confidence: 0.95
📦 Paramètres: {product: "cacao", quantity: "200", unit: "kg"}
```

---

## ⚠️ Dépannage rapide

### Erreur: "Moteur IA non configuré"

**Solution:**
```bash
# Ajouter la clé OpenAI
supabase secrets set OPENAI_API_KEY=sk-...
```

### Erreur: "Route non trouvée"

**Vérifier:**
- Le serveur Supabase Edge Functions est déployé
- L'URL est correcte: `https://{projectId}.supabase.co/functions/v1/make-server-488793d3/ai/interpret`

### Pas de réponse IA

**Vérifier:**
1. Console navigateur → onglet Network → requête `/ai/interpret`
2. Status code 200 ?
3. Réponse JSON valide ?

### Confidence toujours faible

**Améliorer:**
- Ajouter plus d'exemples dans le prompt système
- Être plus précis dans le message utilisateur
- Ajuster la température du modèle (actuellement 0.3)

---

## 🎯 Messages de test recommandés

### Pour Marchand
```
✅ "Je veux vendre 200kg de cacao"
✅ "Combien j'ai gagné aujourd'hui ?"
✅ "Ajouter 5 sacs de riz au panier"
✅ "Voir mon stock"
✅ "J'ai besoin d'aide"
```

### Pour Producteur
```
✅ "Ma récolte de 3 tonnes de café est prête"
✅ "Déclarer ma récolte de bananes"
✅ "Combien vaut ma récolte ?"
✅ "Créer un nouveau cycle agricole"
```

### Pour Coopérative
```
✅ "Combien de membres actifs ?"
✅ "Notre trésorerie est à combien ?"
✅ "Créer un achat groupé"
✅ "Liste des cotisations"
```

---

## 📈 Métriques à surveiller

### Dans OpenAI Dashboard

- **Tokens consommés** (200-400 par requête)
- **Coût** (~0.0002$ par requête avec gpt-4o-mini)
- **Rate limit** (200k tokens/minute pour tier 1)

### Dans votre application

- **Latence moyenne** (1-2 secondes idéalement)
- **Taux de confiance moyen** (> 0.85 recommandé)
- **Intentions "unknown"** (< 10% souhaitable)

---

## 🎉 C'est prêt !

Le moteur d'intention IA est maintenant opérationnel.

**Prochaines étapes:**
1. Tester avec vrais utilisateurs
2. Collecter feedback sur précision
3. Ajuster le prompt si nécessaire
4. Ajouter de nouveaux intents selon besoins

**Support:**
- Documentation complète: `/src/imports/ai-intent-implementation.md`
- Résumé technique: `/AI_INTENT_ENGINE_SUMMARY.md`
- Code source: `/supabase/functions/server/ai-intent.ts`

---

**Bonne utilisation ! 🚀**
