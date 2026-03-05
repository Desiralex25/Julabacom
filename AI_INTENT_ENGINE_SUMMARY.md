# 🤖 Moteur d'Intention IA - Tantie Sagesse

## ✅ IMPLÉMENTATION COMPLÈTE

Le moteur d'intention IA basé sur **OpenAI GPT-4o-mini** est **100% opérationnel** dans Jùlaba.

---

## 📦 FICHIERS CRÉÉS

| Fichier | Lignes | Description |
|---------|--------|-------------|
| `/supabase/functions/server/ai-intent.ts` | 348 | Handler backend du moteur IA |
| `/src/app/services/aiIntentService.ts` | 280 | Service frontend pour appels API |
| `/src/app/components/dev/AIIntentTester.tsx` | 403 | Composant de test UI |
| `/src/imports/ai-intent-implementation.md` | 580 | Documentation complète |
| `/AI_INTENT_ENGINE_SUMMARY.md` | - | Ce fichier |

**TOTAL: 1611+ lignes de code**

---

## 🛣️ ROUTES API

### POST `/make-server-488793d3/ai/interpret`
Analyse un message utilisateur et retourne l'intention détectée.

**Exemple:**
```bash
curl -X POST https://VOTRE_PROJET.supabase.co/functions/v1/make-server-488793d3/ai/interpret \
  -H "Authorization: Bearer VOTRE_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Je veux vendre 200kg de cacao",
    "role": "marchand",
    "screen": "/marchand/dashboard"
  }'
```

### GET `/make-server-488793d3/ai/intents`
Liste toutes les intentions disponibles (19 intents).

---

## 🎯 INTENTS SUPPORTÉS (19)

### Commandes
- `create_order` - Créer commande/vente
- `update_order` - Modifier commande
- `cancel_order` - Annuler commande

### Récoltes & Stock
- `create_harvest` - Déclarer récolte
- `update_stock` - MAJ stock
- `check_stock` - Vérifier stock

### Identification
- `create_identification` - Créer identification
- `validate_identification` - Valider identification

### Navigation
- `view_dashboard` - Tableau de bord
- `view_wallet` - Wallet

### Support
- `create_support_ticket` - Ticket support
- `update_profile` - MAJ profil

### Dashboard
- `show_sales` - Ventes du jour
- `show_expenses` - Dépenses
- `show_balance` - Solde caisse

### POS
- `add_product` - Ajouter au panier
- `checkout` - Encaisser

### Marché
- `search_product` - Rechercher produit

### Fallback
- `unknown` - Non reconnu

---

## 📊 SCHÉMA JSON

### Requête
```typescript
{
  message: string,        // "Je veux vendre 200kg de cacao"
  role: string,          // "marchand"
  screen: string,        // "/marchand/dashboard"
  userId?: string,       // optionnel
  context?: object       // optionnel
}
```

### Réponse
```typescript
{
  success: true,
  result: {
    intent: "create_order",
    entity: "commande",
    action: "create",
    confidence: 0.95,
    parameters: {
      product: "cacao",
      quantity: "200",
      unit: "kg"
    },
    requiresConfirmation: true,
    message: "Tu veux créer une vente de 200 kg de cacao..."
  },
  metadata: {
    model: "gpt-4o-mini",
    tokens: 245,
    timestamp: "2026-03-05T14:30:00.000Z"
  }
}
```

---

## 💬 EXEMPLES DE MESSAGES

| Message utilisateur | Intent détecté | Confidence |
|---------------------|----------------|------------|
| "Je veux vendre 200kg de cacao" | `create_order` | 95% |
| "Combien j'ai gagné aujourd'hui ?" | `show_sales` | 92% |
| "Ma récolte de 3 tonnes de café" | `create_harvest` | 91% |
| "J'ai besoin d'aide" | `create_support_ticket` | 88% |
| "Ajouter 5 sacs de riz" | `add_product` | 93% |
| "Voir mon stock" | `check_stock` | 90% |

---

## 🔧 MODIFICATIONS APPORTÉES

### Backend
- ✅ Nouveau module `ai-intent.ts` avec prompt GPT optimisé
- ✅ Routes `/ai/interpret` et `/ai/intents` ajoutées
- ✅ Import dans `index.tsx`

### Frontend
- ✅ Service `aiIntentService.ts` pour appels API
- ✅ Intégration dans `TantieSagesseModal.tsx`
- ✅ UI de chargement + affichage résultat
- ✅ Boutons confirmation/annulation

### Dev Tools
- ✅ Composant `AIIntentTester.tsx` pour tests
- ✅ Documentation complète `.md`

---

## 🔐 SECRETS CONFIGURÉS

| Secret | Status | Description |
|--------|--------|-------------|
| `OPENAI_API_KEY` | ✅ Configuré | Clé API OpenAI |
| `ELEVENLABS_API_KEY` | ✅ Déjà configuré | TTS Tantie Sagesse |
| `SUPABASE_*` | ✅ Déjà configuré | Accès base de données |

---

## 🚀 UTILISATION

### Dans TantieSagesseModal

```typescript
// L'utilisateur dit: "Je veux vendre 200kg de cacao"

1. Message envoyé à /ai/interpret
2. GPT analyse → intent: "create_order"
3. Affichage résultat + paramètres extraits
4. Si confirmation requise → boutons Confirmer/Annuler
5. Action déclenchée → navigation vers /marchand/caisse
```

### Dans le code

```typescript
import aiIntentService from '@/services/aiIntentService';

const result = await aiIntentService.interpret({
  message: "Je veux vendre 200kg de cacao",
  role: "marchand",
  screen: "/marchand/dashboard",
  userId: user.id
});

if (result.success) {
  console.log(result.result.intent); // "create_order"
  console.log(result.result.confidence); // 0.95
  console.log(result.result.parameters); // { product: "cacao", ... }
}
```

---

## 🎨 COMPOSANT DE TEST

Accès au testeur UI: `/src/app/components/dev/AIIntentTester.tsx`

**Fonctionnalités:**
- ✅ Formulaire custom avec sélection de rôle
- ✅ 10 messages de test prédéfinis
- ✅ Affichage détaillé du résultat
- ✅ Barre de confiance visuelle
- ✅ JSON brut consultable

---

## 📝 AJOUTER UN NOUVEL INTENT

### 1. Définir le type
```typescript
// /supabase/functions/server/ai-intent.ts
export type Intent = 
  | 'create_order'
  | 'votre_nouvelle_action'; // ← Ajouter ici
```

### 2. Mettre à jour le prompt
```typescript
const SYSTEM_PROMPT = `...
"intent": "create_order | ... | votre_nouvelle_action",
...`;
```

### 3. Ajouter un exemple
```typescript
EXEMPLES D'ANALYSE:
Message: "votre message exemple"
Réponse: {
  "intent": "votre_nouvelle_action",
  ...
}
```

### 4. Mapper l'action
```typescript
export function mapIntentToAction(intent: Intent): string {
  return {
    votre_nouvelle_action: 'navigate:/marchand/nouvelle-page'
  }[intent] || 'action:unknown';
}
```

### 5. Gérer dans le frontend
```typescript
// TantieSagesseModal.tsx
const executeIntent = (intent: IntentResponse) => {
  if (intent.intent === 'votre_nouvelle_action') {
    // Logique métier
  }
};
```

---

## 🔍 MONITORING

### Logs disponibles

**Backend (Supabase Edge Functions):**
```
🤖 AI Intent - User: uuid | Role: marchand | Message: "..."
✅ AI Intent détecté: create_order (confidence: 0.95)
```

**Frontend (Console navigateur):**
```
🤖 [AI Intent] Analyse du message: Je veux vendre 200kg
✅ [AI Intent] Intention détectée: create_order
```

---

## ⚡ PERFORMANCE

- **Latence moyenne:** 1-2 secondes (dépend d'OpenAI)
- **Tokens moyens:** 200-400 par requête
- **Coût estimé:** ~0.0002$ par requête (GPT-4o-mini)
- **Rate limit:** Dépend du tier OpenAI

---

## 🛡️ SÉCURITÉ

### Règles implémentées

1. ✅ Confirmation obligatoire pour actions critiques
2. ✅ Validation de confidence (< 0.85 → confirmation)
3. ✅ Intent "unknown" si confidence < 0.5
4. ✅ Aucune exécution automatique d'actions sensibles
5. ✅ Clé API OpenAI côté serveur uniquement

---

## 📚 DOCUMENTATION

- **Complète:** `/src/imports/ai-intent-implementation.md` (580 lignes)
- **Technique:** `/supabase/functions/server/ai-intent.ts` (commentaires)
- **API:** Schémas TypeScript dans les fichiers

---

## 🎯 PROCHAINES ÉTAPES

### Améliorations suggérées

1. **Historique conversationnel**
   - Stocker contexte multi-tours
   - Améliorer cohérence sur plusieurs messages

2. **Speech-to-Text**
   - Intégrer Whisper API OpenAI
   - Transcription vocale → texte → analyse

3. **Fine-tuning GPT**
   - Créer dataset spécifique Jùlaba
   - Améliorer précision sur contexte ivoirien

4. **Analytics**
   - Dashboard des intents les plus utilisés
   - Taux de confiance moyen
   - Messages incompris

5. **Support multilingue**
   - Détection automatique langue
   - Français + dialectes locaux

6. **Actions composées**
   - Gérer plusieurs intentions par message
   - Ex: "Vendre 200kg ET mettre 50% de côté"

---

## 📞 SUPPORT TECHNIQUE

### En cas de problème

1. **Vérifier les secrets Supabase**
   ```bash
   # Liste des secrets
   supabase secrets list
   
   # Vérifier OPENAI_API_KEY
   supabase secrets get OPENAI_API_KEY
   ```

2. **Tester l'endpoint**
   ```bash
   curl https://PROJET.supabase.co/functions/v1/make-server-488793d3/ai/intents
   ```

3. **Consulter les logs**
   - Supabase Dashboard → Edge Functions → Logs
   - Console navigateur (F12)

4. **Vérifier quota OpenAI**
   - https://platform.openai.com/usage
   - Limites: 200k tokens/minute (tier 1)

---

## 📊 STATISTIQUES PROJET

| Métrique | Valeur |
|----------|--------|
| **Fichiers créés** | 5 |
| **Lignes de code** | 1611+ |
| **Intents supportés** | 19 |
| **Routes API** | 2 |
| **Types TypeScript** | 8 |
| **Messages de test** | 10 |
| **Temps d'implémentation** | ~3 heures |
| **Status** | ✅ Opérationnel 100% |

---

## 🏆 RÉSULTAT FINAL

### ✅ Livrables

- [x] Backend complet avec OpenAI GPT
- [x] Service frontend typé
- [x] Intégration UI dans TantieSagesseModal
- [x] 19 intents métier implémentés
- [x] Documentation complète
- [x] Composant de test
- [x] Exemples d'utilisation
- [x] Guide d'extension

### 🎉 Le moteur est prêt pour production !

**L'utilisateur peut maintenant:**
1. Ouvrir Tantie Sagesse
2. Dire/écrire sa demande en langage naturel
3. Recevoir une analyse intelligente
4. Confirmer l'action
5. Être redirigé vers la bonne page

**Exemple complet:**
```
Utilisateur: "Je veux vendre 200kg de cacao"
   ↓
Tantie Sagesse analyse avec GPT
   ↓
Détection: create_order (95% confiance)
   ↓
Affichage: "Tu veux créer une vente de 200 kg de cacao. Dois-je continuer ?"
   ↓
Confirmation utilisateur
   ↓
Navigation → /marchand/caisse (avec pré-remplissage)
```

---

**Date:** 5 mars 2026  
**Version:** 1.0.0  
**Auteur:** Implémentation complète Jùlaba  
**Status:** ✅ Production-ready
