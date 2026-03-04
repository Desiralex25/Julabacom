# Documentation - Système de Gestion des Documents JULABA

## 📋 Vue d'ensemble

Le système de gestion des documents JULABA supporte 4 états distincts avec des UIs et comportements spécifiques pour chaque scénario.

## 🎯 Les 4 Scénarios

### 1️⃣ **EMPTY** - Document non uploadé
**État** : `status: 'empty'`
**UI** :
- Badge "À compléter" (orange/rouge)
- Message d'alerte : "Document obligatoire pour activation complète"
- Indicateur de progression : "X/3 documents complétés"
- 2 boutons avec animation pulsante :
  - 📸 "Prendre une photo" (caméra)
  - 🖼️ "Galerie" (choisir depuis la galerie)
- Conseils de Tantie Sagesse pour bien photographier le document

**Actions disponibles** :
- ✅ Upload via caméra
- ✅ Upload via galerie

---

### 2️⃣ **PENDING** - En attente de vérification
**État** : `status: 'pending', isLocked: false`
**UI** :
- Badge "En vérification" (orange) avec spinner animé
- Message : "En cours de vérification par l'équipe JULABA"
- Timeline : "Envoyé le XX • Validation sous 3-5 jours"
- Image du document affichée en grand
- Bouton rotation (si édition autorisée)
- Indicateur "Pincer pour zoomer"

**Actions disponibles** :
- 🔄 Remplacer le document
- 🗑️ Supprimer (avec confirmation PIN)
- 💾 Télécharger
- 📤 Partager

---

### 3️⃣ **VERIFIED** - Document certifié 🔒
**État** : `status: 'verified', isLocked: true`
**UI** :
- Badge "Vérifié" (vert) avec icône cadenas
- Badge "Protégé" supplémentaire
- Message : "Document certifié et protégé"
- Détails : "Vérifié le XX par [Nom Validateur]"
- Image avec watermark "CERTIFIÉ JULABA" en filigrane
- Indicateur de cadenas en overlay
- **QR Code de vérification** pour authenticité
- Alerte date d'expiration (si applicable)

**Actions disponibles** :
- 👁️ Voir uniquement (lecture seule)
- 💾 Télécharger
- 📤 Partager
- ❌ **Pas de modification/suppression possible**

**Message de sécurité** :
"Document certifié et protégé. Contactez JULABA pour toute modification."

---

### 4️⃣ **REJECTED** - Document refusé ❌
**État** : `status: 'rejected', isLocked: false`
**UI** :
- Badge "Rejeté" (rouge) avec animation shake
- Message d'erreur : Raison du rejet (ex: "Photo floue")
- Image du document avec overlay rouge semi-transparent
- Badge "REFUSÉ" en surimpression
- Conseils pour corriger le problème

**Actions disponibles** :
- 🔄 Re-uploader immédiatement
- 💡 Voir les conseils d'amélioration

**Exemples de raisons de rejet** :
- "Photo floue - Veuillez reprendre une photo nette"
- "Document illisible - Améliorez l'éclairage"
- "Informations manquantes - Document incomplet"
- "Document expiré - Fournir un document à jour"

---

## 🎨 Codes Couleurs JULABA

| État | Couleur | Hex | Usage |
|------|---------|-----|-------|
| **Empty** | Orange | `#C46210` | Urgence à compléter |
| **Rejected** | Rouge | `#DC2626` | Action requise |
| **Pending** | Orange | `#C46210` | En attente |
| **Verified** | Vert | `#059669` | Succès/Certifié |

---

## 🔐 Sécurité & Verrouillage

### Règles de verrouillage (`isLocked`)
```typescript
// Document vérifiable/modifiable
isLocked: false
→ Peut être remplacé, supprimé, modifié

// Document certifié (lecture seule absolue)
isLocked: true
→ Aucune modification possible
→ Seuls les Identificateurs peuvent déverrouiller (cas exceptionnels)
```

### Confirmation PIN pour suppression
- Si le marchand a activé son code de sécurité à 4 chiffres
- Modal de confirmation avec saisie du PIN
- Animation shake si PIN incorrect
- Message : "Cette action est irréversible"

---

## 📊 Structure de données

```typescript
interface DocumentData {
  id: string;
  type: string;
  title: string;
  status: 'empty' | 'pending' | 'verified' | 'rejected';
  imageUrl: string | null;
  uploadedAt: string | null;
  verifiedAt: string | null;
  verifiedBy: string | null;
  rejectionReason: string | null;
  expirationDate: string | null;
  isLocked: boolean;
  details: { [key: string]: string };
  qrCode?: string;
}
```

---

## 🎭 Animations Contextuelles

### Empty
- **Pulsing ring** autour des boutons upload
- **Indicateur de progression** qui se remplit

### Pending
- **Spinner orange** sur le badge de statut
- **Fade-in** de l'image après upload

### Verified
- **Confettis verts** lors de la 1ère ouverture
- **Glow effect** sur le QR code

### Rejected
- **Shake animation** sur le message d'erreur
- **Red overlay pulsante** sur l'image rejetée

---

## 🗣️ Intégration Tantie Sagesse (Vocal)

### Messages vocaux par scénario

**Empty** :
- "Placez votre document à plat, bien éclairé, sans reflet"
- "Ouverture de l'appareil photo"
- "Ouverture de la galerie"

**Pending** :
- "Document en cours de vérification par l'équipe JULABA"
- "Document chargé avec succès"

**Verified** :
- "Document certifié et vérifié par JULABA"
- "Téléchargement du document certifié"

**Rejected** :
- "Document refusé. [Raison]. Veuillez charger un nouveau document"

---

## 🔄 Workflow Complet

```
1. EMPTY → Upload
   ↓
2. PENDING → Attente validation (3-5 jours)
   ↓
   ├─→ VERIFIED (si approuvé) → isLocked = true
   │
   └─→ REJECTED (si refusé) → Retour à EMPTY pour re-upload
```

---

## 💡 Conseils d'implémentation

### Pour changer l'état d'un document :
```typescript
const handleUpdateDocument = (documentType: string, updatedDoc: DocumentData) => {
  setDocuments(prev => ({
    ...prev,
    [documentType]: updatedDoc
  }));
};
```

### Pour tester les différents scénarios :
```typescript
// Exemple : Document vide
status: 'empty',
imageUrl: null,
isLocked: false

// Exemple : Document en attente
status: 'pending',
imageUrl: 'https://...',
uploadedAt: new Date().toISOString(),
isLocked: false

// Exemple : Document vérifié
status: 'verified',
imageUrl: 'https://...',
verifiedAt: '2024-01-15T14:30:00Z',
verifiedBy: 'Jean Koffi - Bureau Abidjan',
isLocked: true

// Exemple : Document rejeté
status: 'rejected',
imageUrl: 'https://...',
rejectionReason: 'Photo floue - Veuillez reprendre',
isLocked: false
```

---

## 🚀 Prochaines étapes (Backend)

1. **Intégration Supabase** pour persistance
2. **Table `documents`** avec RLS (Row Level Security)
3. **Table `document_history`** pour audit trail
4. **Upload vers Supabase Storage** pour les images
5. **Génération de hash SHA-256** pour intégrité
6. **Webhooks** pour notifications push
7. **Interface Identificateur** pour validation

---

## 📞 Contact

Pour toute question sur l'implémentation, contactez l'équipe technique JULABA.

**Version** : 1.0.0
**Date** : Mars 2026
