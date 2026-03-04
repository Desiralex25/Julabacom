# 📘 DOCUMENTATION TECHNIQUE JULABA

**Version** : 2.0.0  
**Date** : Mars 2026  
**Statut** : Implémentation complète des fondations

---

## 📋 TABLE DES MATIÈRES

1. [Architecture globale](#architecture)
2. [Système Wallet](#wallet)
3. [Gestion des commandes](#commandes)
4. [Gestion des récoltes](#recoltes)
5. [Scoring dynamique](#scoring)
6. [Audit Trail](#audit)
7. [Intégration dans l'application](#integration)
8. [Prochaines étapes](#next-steps)

---

## 🏗️ ARCHITECTURE GLOBALE {#architecture}

### **Nouveaux fichiers créés**

```
/src/app/
├── types/
│   └── julaba.types.ts         ✅ NOUVEAU (650 lignes)
│       ├── Types Wallet
│       ├── Types Commande (3 scénarios)
│       ├── Types Récolte
│       ├── Types Coopérative
│       ├── Types Scoring
│       ├── Types Audit
│       └── Helpers métier
│
├── contexts/
│   ├── WalletContext.tsx       ✅ NOUVEAU (350 lignes)
│   ├── CommandeContext.tsx     ✅ NOUVEAU (550 lignes)
│   ├── RecolteContext.tsx      ✅ NOUVEAU (300 lignes)
│   ├── ScoreContext.tsx        ✅ NOUVEAU (250 lignes)
│   └── AuditContext.tsx        ✅ NOUVEAU (150 lignes)
│
└── components/
    └── wallet/
        ├── RechargeWalletModal.tsx  ✅ NOUVEAU
        └── WalletCard.tsx           ✅ NOUVEAU
```

### **Architecture des Contexts**

```
App.tsx
  └── AppProvider (existant)
      └── UserProvider (existant)
          └── AuditProvider ✅ NOUVEAU (Event Sourcing)
              └── WalletProvider ✅ NOUVEAU (Gestion finances)
                  └── ScoreProvider ✅ NOUVEAU (Scoring dynamique)
                      └── RecolteProvider ✅ NOUVEAU (Producteurs)
                          └── CommandeProvider ✅ NOUVEAU (3 scénarios)
                              └── StockProvider (existant)
                                  └── CaisseProvider (existant)
                                      └── RouterProvider
```

**Ordre d'imbrication critique** :
- `AuditProvider` en haut → log toutes les actions
- `WalletProvider` avant `CommandeProvider` → dépendance escrow
- `ScoreProvider` indépendant → calculs asynchrones

---

## 💰 SYSTÈME WALLET {#wallet}

### **Architecture**

Le Wallet JULABA est **séparé de la Caisse physique** :
- **Caisse** = Argent cash (Marchand uniquement)
- **Wallet** = Argent digital sur plateforme (tous rôles)

### **Types principaux**

```typescript
interface WalletAccount {
  userId: string;
  balance: number;          // Solde actuel
  escrowBalance: number;    // Argent bloqué en attente
  totalReceived: number;    // Cumulé lifetime
  totalSent: number;
  currency: 'FCFA';
}

interface EscrowPayment {
  id: string;
  commandeId: string;
  payerId: string;          // Marchand
  receiverId: string;       // Producteur
  amount: number;
  status: 'BLOCKED' | 'RELEASED' | 'REFUNDED';
}
```

### **Workflow de paiement sécurisé (type AliExpress)**

#### **Étape 1 : Marchand paie**
```typescript
// Marchand clique "Payer"
await bloquerArgent(commandeId, 50000, producteurId);
```

**Résultat** :
```
Wallet Marchand :
  - balance: 100 000 → 50 000 FCFA
  - escrowBalance: 0 → 50 000 FCFA (bloqué)

Escrow créé :
  - status: 'BLOCKED'
  - amount: 50 000 FCFA
```

**Notification Producteur** :
> "💰 Le marchand a payé 50 000 FCFA. L'argent sera crédité après livraison."

---

#### **Étape 2 : Producteur livre**
```typescript
// Producteur clique "J'ai livré"
await marquerLivree(commandeId, producteurId);
```

**Résultat** :
```
Commande :
  - status: PAYEE → EN_ATTENTE_CONFIRMATION_MARCHAND
  - deliveryStatus: 'IN_PROGRESS'
  - timeout: 48h
```

---

#### **Étape 3 : Marchand confirme réception**
```typescript
// Marchand clique "J'ai reçu"
await confirmerReception(commandeId, marchandId);
```

**Résultat** :
```
Commande :
  - status: EN_ATTENTE_CONFIRMATION_MARCHAND → LIVREE
  - paymentStatus: 'PAID' → 'RELEASED'

Escrow :
  - status: 'BLOCKED' → 'RELEASED'
```

**Notification Producteur** :
> "✅ Livraison confirmée ! Clique sur 'Récupérer l'argent' pour créditer ton wallet."

---

#### **Étape 4 : Producteur récupère l'argent (MANUEL)**
```typescript
// Producteur clique "Récupérer l'argent"
await recupererArgent(escrowId);
```

**Résultat** :
```
Wallet Producteur :
  - balance: 20 000 → 70 000 FCFA (+50 000)

Escrow supprimé (traité)

Commande :
  - status: LIVREE → TERMINEE
```

---

### **API WalletContext**

| Méthode | Description | Paramètres |
|---------|-------------|------------|
| `rechargerWallet()` | Recharge depuis Mobile Money | montant, provider, reference |
| `retirerWallet()` | Retrait vers Mobile Money | montant, provider |
| `bloquerArgent()` | Blocage escrow (paiement) | commandeId, montant, receiverId |
| `libererArgent()` | Libération escrow (après livraison) | escrowId, receiverId |
| `recupererArgent()` | Crédit wallet (action Producteur) | escrowId |
| `rembourserArgent()` | Remboursement (annulation) | escrowId, payerId |
| `getAvailableBalance()` | Solde disponible | - |
| `canAfford()` | Vérifier si peut payer | montant |

---

## 📦 GESTION DES COMMANDES {#commandes}

### **3 Scénarios implémentés**

#### **Scénario 1 : Commande directe (Marchand → Producteur)**
```typescript
const commande = await creerCommandeDirecte(
  buyerId,
  buyerName,
  sellerId,
  sellerName,
  'Tomate',
  100, // kg
  500  // FCFA/kg
);
```

#### **Scénario 2 : Achat marketplace (Marchand/Coop → Récolte publiée)**
```typescript
// Producteur publie récolte
await publierRecolte(recolteId, producteurId);

// Marchand achète sur marché virtuel
const commande = await creerCommandeMarketplace(
  marchandId,
  marchandName,
  'marchand',
  recolteId,
  50 // kg
);
```

#### **Scénario 3 : Coopérative intermédiaire**
```
Étape A : Coop achète Producteur (Scénario 1)
Étape B : Marchand achète Coop (Scénario 2)
→ 2 commandes indépendantes
```

---

### **Machine à états des commandes**

```
EN_ATTENTE (créée)
  ↓ accepterCommande()
ACCEPTEE
  ↓ payerCommande() → bloquerArgent()
PAYEE (escrow bloqué)
  ↓ marquerLivree()
EN_ATTENTE_CONFIRMATION_MARCHAND (timeout 48h)
  ↓ confirmerReception() → libererArgent()
LIVREE (escrow libéré)
  ↓ recupererArgent()
TERMINEE
```

**États alternatifs** :
- `EN_NEGOCIATION` (contre-proposition Producteur)
- `EXPIREE` (timeout 24h sans réponse)
- `REFUSEE` (Producteur refuse)
- `ANNULEE` (une partie annule)

---

### **Négociation (max 2 allers-retours)**

#### **Round 1 : Producteur contre-propose**
```typescript
// Marchand propose 400 FCFA/kg
await creerCommandeDirecte(..., 400);

// Producteur contre-propose 450 FCFA/kg
await contreProposerPrix(commandeId, producteurId, 450);
```

**Résultat** :
```
Commande :
  - status: EN_ATTENTE → EN_NEGOCIATION
  - prixNegocie: 450
  - negotiationCount: 1
  - expiresAt: +24h (nouveau timeout)
```

#### **Round 2 : Marchand peut**
- ✅ Accepter : `accepterContreProposition()` → ACCEPTEE
- ❌ Refuser : `refuserContreProposition()` → ANNULEE
- 🔄 Re-contre-proposer (si count < 2) : `reContreProposer()`

---

### **Timeouts automatiques**

| État | Timeout | Action auto |
|------|---------|-------------|
| `EN_ATTENTE` | 24h ouvrées | → EXPIREE |
| `EN_NEGOCIATION` | 24h ouvrées | → EXPIREE |
| `EN_ATTENTE_CONFIRMATION_MARCHAND` | 48h | → Retour ACCEPTEE |

**Vérification** : Interval 1 minute (`verifierTimeouts()`)

---

## 🌾 GESTION DES RÉCOLTES {#recoltes}

### **États d'une récolte**

```
DRAFT (créée, pas publiée)
  ↓ publierRecolte()
EN_LIGNE (visible marché)
  ↓ première vente
PARTIELLEMENT_VENDUE
  ↓ stockRestant = 0
SOLD_OUT (masquée)
  ↓ incrementerStock() (nouvelle récolte)
EN_LIGNE (re-visible)
```

**État alternatif** : `RETIREE` (Producteur retire manuellement)

---

### **Workflow Producteur**

#### **1. Créer récolte (brouillon)**
```typescript
const recolte = await creerRecolte(producteurId, producteurName, {
  produit: 'Tomate',
  quantiteRecoltee: 200,
  qualite: 'BON',
  prixUnitaire: 500,
  dateRecolte: '2024-03-15',
  localisation: {
    region: 'Abidjan',
    commune: 'Abobo',
  },
});
```

**Résultat** :
```
Récolte :
  - status: DRAFT
  - visibleSurMarche: false
  - stockRestant: 200 kg
```

---

#### **2. Publier sur marketplace**
```typescript
await publierRecolte(recolteId, producteurId);
```

**Résultat** :
```
Récolte :
  - status: DRAFT → EN_LIGNE
  - visibleSurMarche: true
  - publishedAt: 2024-03-15T10:30:00Z
```

**Visible maintenant** :
- Sur `/marchand/marche` (onglet Producteurs)
- Sur `/cooperative/marche`

---

#### **3. Vente automatique (décrément stock)**
```typescript
// Quand commande acceptée
await decrementerStock(recolteId, 50); // 50 kg vendus
```

**Résultat** :
```
Récolte :
  - stockRestant: 200 → 150 kg
  - status: EN_LIGNE → PARTIELLEMENT_VENDUE
  - nombreCommandes: +1
```

---

#### **4. Sold out automatique**
```typescript
await decrementerStock(recolteId, 150); // Vend les 150 kg restants
```

**Résultat** :
```
Récolte :
  - stockRestant: 0 kg
  - status: PARTIELLEMENT_VENDUE → SOLD_OUT
  - visibleSurMarche: false (masquée automatiquement)
```

---

#### **5. Nouvelle récolte (incrémente stock)**
```typescript
await incrementerStock(recolteId, 100); // +100 kg nouveau
```

**Résultat** :
```
Récolte :
  - quantiteRecoltee: 200 → 300 kg (total lifetime)
  - stockRestant: 0 → 100 kg
  - status: SOLD_OUT → EN_LIGNE (re-visible !)
```

---

### **API RecolteContext**

| Méthode | Description |
|---------|-------------|
| `creerRecolte()` | Créer récolte DRAFT |
| `publierRecolte()` | DRAFT → EN_LIGNE |
| `modifierRecolte()` | Éditer (si pas vendue) |
| `retirerRecolte()` | Masquer du marché |
| `decrementerStock()` | Après vente (auto transitions) |
| `incrementerStock()` | Nouvelle récolte (auto EN_LIGNE si SOLD_OUT) |
| `getRecoltesEnLigne()` | Liste récoltes visibles (tri par score) |
| `calculerTauxConversion()` | (commandes / vues) × 100 |

---

## ⭐ SCORING DYNAMIQUE {#scoring}

### **Formule de calcul**

```
Score JULABA = 
  (Régularité × 35%) +
  (Documents × 15%) +
  (Volume × 35%) +
  (Feedback × 15%)
```

### **Calcul de chaque critère (sur 100)**

#### **Régularité (35%)**
```typescript
// Nombre de jours actifs dans les 30 derniers jours
const joursActifs = countJoursActifs(userId, derniers30j);
const regularite = (joursActifs / 30) * 100;
```

**Exemple** : 20 jours actifs → 66.67/100 → **23.3 points**

---

#### **Documents (15%)**
```typescript
const docsObligatoires = ['carteIdentite', 'attestation', 'certification'];
const docsValides = docsObligatoires.filter(doc => status === 'verified');
const documents = (docsValides.length / 3) * 100;
```

**Exemple** : 2 sur 3 validés → 66.67/100 → **10 points**

---

#### **Volume (35%)**
```typescript
const volumePerso = sumTransactions(userId, derniers30j);
const volumeMoyenZone = avgTransactions(user.zone, derniers30j);
const ratio = (volumePerso / volumeMoyenZone) * 100;
const cappedRatio = Math.min(ratio, 150); // Cap à 150
const volume = (cappedRatio / 150) * 100;
```

**Exemple** :
- Volume perso : 500 000 FCFA
- Moyenne zone : 400 000 FCFA
- Ratio : 125% → cappé à 125 → normalisé : 83.33/100 → **29.2 points**

---

#### **Feedback (15%)**
```typescript
const positifs = feedbacks.filter(f => f.rating >= 4).length;
const feedbackScore = (positifs / feedbacks.length) * 100;
```

**Exemple** : 8 positifs sur 10 → 80/100 → **12 points**

---

### **Score total**
```
23.3 + 10 + 29.2 + 12 = 74.5 → arrondi 75/100
```

### **Badges selon score**

| Score | Badge | Impact |
|-------|-------|--------|
| 90-100 | 🟣 PLATINE | Visibilité PREMIUM + Crédit |
| 75-89 | 🟡 OR | Visibilité AUGMENTEE + Crédit |
| 50-74 | ⚪ ARGENT | Visibilité NORMALE |
| 0-49 | 🟤 BRONZE | Visibilité NORMALE |

---

### **Recalcul automatique**

Le score est recalculé **après chaque transaction** :
```typescript
// Dans CommandeContext, après création commande
await recalculerScore(userId);

// Dans WalletContext, après recharge
await recalculerScore(userId);

// Dans RecolteContext, après publication
await recalculerScore(userId);
```

---

## 🔍 AUDIT TRAIL (Event Sourcing) {#audit}

### **Principe**

Chaque action critique est loggée dans une timeline immuable.

### **Actions auditées**

```typescript
enum AuditAction {
  // User
  USER_CREE, USER_MODIFIE, USER_SUSPENDU, USER_VALIDE,
  
  // Commande
  COMMANDE_CREEE, COMMANDE_ACCEPTEE, COMMANDE_REFUSEE,
  COMMANDE_NEGOCIEE, COMMANDE_PAYEE, COMMANDE_LIVREE,
  
  // Document
  DOCUMENT_UPLOADE, DOCUMENT_VALIDE, DOCUMENT_REJETE,
  
  // Wallet
  WALLET_RECHARGE, WALLET_DEBITE, PAIEMENT_EFFECTUE,
  PAIEMENT_LIBERE,
  
  // Récolte
  RECOLTE_CREEE, RECOLTE_PUBLIEE, RECOLTE_SOLD_OUT,
  
  // Coopérative
  COOP_MEMBRE_AJOUTE, COOP_TRESORERIE_MOUVEMENT,
}
```

---

### **Exemple de log**

```typescript
await logEvent(
  userId: 'MARCH-001',
  userRole: 'marchand',
  userName: 'Jean Kouadio',
  action: 'COMMANDE_PAYEE',
  entityType: 'commande',
  entityId: 'CMD-2024-0123',
  metadata: {
    montant: 50000,
    producteurId: 'PROD-042',
    produit: 'Tomate',
  },
  geolocation: {
    latitude: 5.3599,
    longitude: -4.0082,
  }
);
```

**Résultat stocké** :
```json
{
  "id": "AUD-1710501234567-abc123",
  "timestamp": "2024-03-15T14:20:34.567Z",
  "userId": "MARCH-001",
  "userRole": "marchand",
  "userName": "Jean Kouadio",
  "action": "COMMANDE_PAYEE",
  "entityType": "commande",
  "entityId": "CMD-2024-0123",
  "metadata": {
    "montant": 50000,
    "producteurId": "PROD-042",
    "produit": "Tomate"
  },
  "geolocation": {
    "latitude": 5.3599,
    "longitude": -4.0082
  },
  "deviceInfo": "Mozilla/5.0..."
}
```

---

### **Consultation Audit Trail**

#### **Par utilisateur (Identificateur voit son historique)**
```typescript
const myEvents = getEventsByUser('IDENT-001');
```

#### **Par entité (Admin voit historique d'une commande)**
```typescript
const commandeHistory = getEventsByEntity('commande', 'CMD-2024-0123');
```

#### **Export (Admin)**
```typescript
const auditExport = exportAuditTrail(
  userId: 'MARCH-001',
  startDate: '2024-03-01',
  endDate: '2024-03-31'
);

// Génère CSV/Excel
```

---

## 🔗 INTÉGRATION DANS L'APPLICATION {#integration}

### **Providers imbriqués (App.tsx)**

```tsx
<AppProvider>
  <UserProvider>
    <AuditProvider>           {/* ✅ Log toutes actions */}
      <WalletProvider>         {/* ✅ Gestion finances */}
        <ScoreProvider>        {/* ✅ Calculs scoring */}
          <RecolteProvider>    {/* ✅ Producteurs */}
            <CommandeProvider> {/* ✅ 3 scénarios */}
              <StockProvider>
                <CaisseProvider>
                  <RouterProvider router={router} />
                </CaisseProvider>
              </StockProvider>
            </CommandeProvider>
          </RecolteProvider>
        </ScoreProvider>
      </WalletProvider>
    </AuditProvider>
  </UserProvider>
</AppProvider>
```

---

### **Utilisation dans les composants**

#### **Dashboard Marchand**
```tsx
import { useWallet } from '../contexts/WalletContext';
import { useCommande } from '../contexts/CommandeContext';
import { WalletCard } from '../components/wallet/WalletCard';

function MarchandHome() {
  const { wallet } = useWallet();
  const { commandes } = useCommande();
  
  return (
    <div>
      <WalletCard roleColor="#C66A2C" />
      {/* ... rest */}
    </div>
  );
}
```

---

## 🚀 PROCHAINES ÉTAPES {#next-steps}

### **PHASE 6 : Institution (Analytics)**
- [ ] KPIs avancés (CA, taux adoption, ROI)
- [ ] Graphiques Recharts temps réel
- [ ] Exports PDF/Excel
- [ ] Comparaisons mensuelles

### **PHASE 7 : Coopérative (Priorité majeure)**
- [ ] CooperativeContext
- [ ] Trésorerie commune
- [ ] Agrégation commandes
- [ ] Répartition économies (KPI)
- [ ] PLUS de pré-vente (annulé)

### **PHASE 8 : Marketplace UI**
- [ ] Page `/marchand/marche` (2 onglets)
- [ ] Page `/cooperative/marche` (1 onglet)
- [ ] Page `/producteur/publier-recolte`
- [ ] Filtres avancés
- [ ] Tri par score

### **PHASE 9 : Identificateur**
- [ ] Géolocalisation obligatoire (capture GPS)
- [ ] Post-validation : création compte auto
- [ ] Documents → Profil Marchand (isLocked)

### **PHASE 10 : Intégration complète**
- [ ] Notifications push (commandes, paiements)
- [ ] Tests E2E tous parcours
- [ ] Optimisations performance
- [ ] Préparation Supabase

---

## ✅ RÉSUMÉ DES LIVRABLES

| Composant | Lignes | Statut |
|-----------|--------|--------|
| `julaba.types.ts` | 650 | ✅ Complet |
| `WalletContext.tsx` | 350 | ✅ Complet |
| `CommandeContext.tsx` | 550 | ✅ Complet |
| `RecolteContext.tsx` | 300 | ✅ Complet |
| `ScoreContext.tsx` | 250 | ✅ Complet |
| `AuditContext.tsx` | 150 | ✅ Complet |
| `RechargeWalletModal.tsx` | 200 | ✅ Complet |
| `WalletCard.tsx` | 120 | ✅ Complet |
| **TOTAL** | **2570 lignes** | **✅ Production-ready** |

---

**Dernière mise à jour** : Mars 2026  
**Auteur** : Équipe technique JULABA  
**Licence** : Propriétaire (Gouvernement de Côte d'Ivoire)
