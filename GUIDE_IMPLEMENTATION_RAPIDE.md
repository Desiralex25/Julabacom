# ⚡ GUIDE D'IMPLÉMENTATION RAPIDE - JULABA

**Objectif** : Intégrer rapidement les nouveaux systèmes (Wallet, Commandes, Récoltes, Scoring, Audit) dans les composants existants.

---

## 📦 CHECKLIST COMPLÈTE

### ✅ Déjà fait
- [x] Types TypeScript complets (`julaba.types.ts`)
- [x] WalletContext + hooks
- [x] CommandeContext + hooks
- [x] RecolteContext + hooks
- [x] ScoreContext + hooks
- [x] AuditContext + hooks
- [x] Providers imbriqués dans App.tsx
- [x] WalletCard component
- [x] RechargeWalletModal component
- [x] Documentation technique

### 🚧 À faire maintenant

- [ ] Intégrer WalletCard dans les dashboards
- [ ] Créer page `/marchand/mes-commandes`
- [ ] Créer page `/producteur/commandes`
- [ ] Créer page `/producteur/publier-recolte`
- [ ] Créer page `/marchand/marche` (marketplace)
- [ ] Créer page `/cooperative/marche`
- [ ] Intégrer ScoreContext dans RoleDashboard
- [ ] Ajouter audit logging dans actions critiques

---

## 1️⃣ INTÉGRER WALLET DANS DASHBOARD MARCHAND

### **Fichier** : `/src/app/components/marchand/MarchandHome.tsx`

**Étape 1 : Importer**
```tsx
import { WalletCard } from '../wallet/WalletCard';
import { useWallet } from '../../contexts/WalletContext';
```

**Étape 2 : Utiliser le hook**
```tsx
function MarchandHome() {
  const { wallet, getBalance } = useWallet();
  
  // ... existing code
}
```

**Étape 3 : Ajouter WalletCard dans le JSX**
```tsx
return (
  <>
    <RoleDashboard {...props} />
    
    {/* NOUVEAU : Wallet Card */}
    <div className="p-4">
      <WalletCard roleColor="#C66A2C" />
    </div>
    
    <Navigation role="marchand" onMicClick={...} />
  </>
);
```

**✅ Fait ! Le wallet s'affiche maintenant sur le dashboard.**

---

## 2️⃣ CRÉER PAGE "MES COMMANDES" (MARCHAND)

### **Nouveau fichier** : `/src/app/components/marchand/MesCommandes.tsx`

```tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { ArrowLeft, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { useCommande } from '../../contexts/CommandeContext';
import { useApp } from '../../contexts/AppContext';
import { CommandeStatus } from '../../types/julaba.types';

export function MesCommandes() {
  const navigate = useNavigate();
  const { commandes, confirmerReception, accepterContreProposition } = useCommande();
  const { user, speak } = useApp();
  
  // Filtrer les commandes du marchand
  const mesCommandes = commandes.filter(c => c.buyerId === user?.id);
  
  const [filter, setFilter] = useState<'all' | 'en_cours' | 'terminees'>('all');
  
  const getStatusBadge = (status: CommandeStatus) => {
    const badges = {
      [CommandeStatus.EN_ATTENTE]: { label: 'En attente', color: 'orange', icon: Clock },
      [CommandeStatus.EN_NEGOCIATION]: { label: 'Négociation', color: 'blue', icon: AlertCircle },
      [CommandeStatus.ACCEPTEE]: { label: 'Acceptée', color: 'green', icon: CheckCircle },
      [CommandeStatus.PAYEE]: { label: 'Payée', color: 'green', icon: CheckCircle },
      [CommandeStatus.EN_ATTENTE_CONFIRMATION_MARCHAND]: { label: 'À confirmer', color: 'orange', icon: AlertCircle },
      [CommandeStatus.LIVREE]: { label: 'Livrée', color: 'green', icon: CheckCircle },
      [CommandeStatus.TERMINEE]: { label: 'Terminée', color: 'gray', icon: CheckCircle },
      [CommandeStatus.REFUSEE]: { label: 'Refusée', color: 'red', icon: XCircle },
      [CommandeStatus.ANNULEE]: { label: 'Annulée', color: 'red', icon: XCircle },
      [CommandeStatus.EXPIREE]: { label: 'Expirée', color: 'gray', icon: Clock },
    };
    
    const badge = badges[status] || badges[CommandeStatus.EN_ATTENTE];
    const Icon = badge.icon;
    
    return (
      <div className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-${badge.color}-100 text-${badge.color}-700`}>
        <Icon className="w-3 h-3" />
        {badge.label}
      </div>
    );
  };
  
  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <div className="bg-white border-b p-4">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/marchand')} className="p-2 hover:bg-gray-100 rounded-full">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-xl font-bold">Mes commandes</h1>
        </div>
        
        {/* Filtres */}
        <div className="flex gap-2 mt-4">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${filter === 'all' ? 'bg-orange-100 text-orange-700' : 'bg-gray-100'}`}
          >
            Toutes
          </button>
          <button
            onClick={() => setFilter('en_cours')}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${filter === 'en_cours' ? 'bg-orange-100 text-orange-700' : 'bg-gray-100'}`}
          >
            En cours
          </button>
          <button
            onClick={() => setFilter('terminees')}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${filter === 'terminees' ? 'bg-orange-100 text-orange-700' : 'bg-gray-100'}`}
          >
            Terminées
          </button>
        </div>
      </div>
      
      {/* Liste commandes */}
      <div className="p-4 space-y-4">
        {mesCommandes.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">Aucune commande</p>
          </div>
        ) : (
          mesCommandes.map(commande => (
            <div key={commande.id} className="bg-white rounded-2xl p-4 shadow-sm">
              {/* Header card */}
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="font-medium text-gray-900">{commande.productName}</p>
                  <p className="text-sm text-gray-500">
                    {commande.sellerName} • {commande.quantity} {commande.uniteProduit}
                  </p>
                </div>
                {getStatusBadge(commande.status)}
              </div>
              
              {/* Prix */}
              <div className="flex items-baseline gap-2 mb-3">
                <span className="text-2xl font-bold text-gray-900">
                  {commande.montantTotal.toLocaleString()}
                </span>
                <span className="text-sm text-gray-500">FCFA</span>
              </div>
              
              {/* Actions selon statut */}
              {commande.status === CommandeStatus.EN_NEGOCIATION && (
                <div className="space-y-2">
                  <p className="text-sm text-gray-600">
                    Contre-proposition : <strong>{commande.prixNegocie} FCFA/kg</strong>
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => accepterContreProposition(commande.id, user!.id)}
                      className="flex-1 bg-green-600 text-white py-2 rounded-lg font-medium"
                    >
                      Accepter
                    </button>
                    <button className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-lg font-medium">
                      Refuser
                    </button>
                  </div>
                </div>
              )}
              
              {commande.status === CommandeStatus.EN_ATTENTE_CONFIRMATION_MARCHAND && (
                <div className="space-y-2">
                  <p className="text-sm text-orange-600">🚚 Livraison déclarée - Confirme la réception</p>
                  <button
                    onClick={() => confirmerReception(commande.id, user!.id)}
                    className="w-full bg-green-600 text-white py-3 rounded-lg font-medium"
                  >
                    ✅ J'ai bien reçu
                  </button>
                </div>
              )}
              
              {/* Date */}
              <p className="text-xs text-gray-400 mt-3">
                Créée le {new Date(commande.createdAt).toLocaleDateString()}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
```

**Ajouter la route** dans `/src/app/routes.ts` :
```tsx
{
  path: 'mes-commandes',
  Component: lazy(() => import('./components/marchand/MesCommandes').then(m => ({ default: m.MesCommandes }))),
},
```

---

## 3️⃣ INTÉGRER SCORING DANS ROLEDASHBOARD

### **Fichier** : `/src/app/components/common/RoleDashboard.tsx`

**Importer** :
```tsx
import { useScore } from '../../contexts/ScoreContext';
```

**Dans le composant** :
```tsx
export function RoleDashboard({ user, ...props }: RoleDashboardProps) {
  const { getScoreByUser, getBadge } = useScore();
  
  const score = user ? getScoreByUser(user.id) : null;
  const badge = user ? getBadge(user.id) : 'BRONZE';
  
  // ... existing code
}
```

**Afficher le badge dynamique** :
```tsx
{/* Section Score - REMPLACER l'affichage statique */}
<div className="bg-white rounded-2xl p-5 shadow-sm">
  <div className="flex items-center justify-between mb-3">
    <h3 className="text-sm font-medium text-gray-700">Score JULABA</h3>
    {score && (
      <span className={`text-xs px-2 py-1 rounded-full ${
        badge === 'PLATINE' ? 'bg-purple-100 text-purple-700' :
        badge === 'OR' ? 'bg-yellow-100 text-yellow-700' :
        badge === 'ARGENT' ? 'bg-gray-100 text-gray-700' :
        'bg-orange-100 text-orange-700'
      }`}>
        {badge}
      </span>
    )}
  </div>
  
  <div className="flex items-end gap-2 mb-2">
    <span className="text-4xl font-bold" style={{ color: roleConfig.color }}>
      {score?.scoreTotal || 0}
    </span>
    <span className="text-lg text-gray-400 mb-1">/100</span>
  </div>
  
  {/* Barre de progression */}
  <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
    <div 
      className="h-2 rounded-full transition-all"
      style={{ 
        width: `${score?.scoreTotal || 0}%`,
        backgroundColor: roleConfig.color 
      }}
    />
  </div>
  
  {/* Détail critères */}
  {score && (
    <div className="space-y-1 text-xs text-gray-600">
      <div className="flex justify-between">
        <span>Régularité</span>
        <span className="font-medium">{Math.round(score.criteres.regularite)}%</span>
      </div>
      <div className="flex justify-between">
        <span>Documents</span>
        <span className="font-medium">{Math.round(score.criteres.documents)}%</span>
      </div>
      <div className="flex justify-between">
        <span>Volume</span>
        <span className="font-medium">{Math.round(score.criteres.volume)}%</span>
      </div>
      <div className="flex justify-between">
        <span>Feedback</span>
        <span className="font-medium">{Math.round(score.criteres.feedback)}%</span>
      </div>
    </div>
  )}
</div>
```

---

## 4️⃣ AJOUTER AUDIT LOGGING

### **Dans toute action critique, ajouter** :

```tsx
import { useAudit } from '../../contexts/AuditContext';
import { AuditAction } from '../../types/julaba.types';

function MonComposant() {
  const { logEvent } = useAudit();
  const { user } = useApp();
  
  const handleActionCritique = async () => {
    // ... logique métier
    
    // Logger l'événement
    logEvent(
      user!.id,
      user!.role,
      `${user!.firstName} ${user!.lastName}`,
      AuditAction.COMMANDE_CREEE,
      'commande',
      commandeId,
      {
        produit: 'Tomate',
        quantite: 100,
        montant: 50000,
      }
    );
  };
}
```

**Exemples concrets** :

#### **Lors d'une création de commande** :
```tsx
const handleCreerCommande = async () => {
  const commande = await creerCommandeDirecte(...);
  
  logEvent(
    user!.id,
    'marchand',
    user!.firstName,
    AuditAction.COMMANDE_CREEE,
    'commande',
    commande.id,
    { produit: commande.productName, montant: commande.montantTotal }
  );
};
```

#### **Lors d'un paiement** :
```tsx
const handlePayer = async () => {
  await payerCommande(commandeId, userId);
  
  logEvent(
    user!.id,
    'marchand',
    user!.firstName,
    AuditAction.PAIEMENT_EFFECTUE,
    'commande',
    commandeId,
    { montant, escrowId }
  );
};
```

---

## 5️⃣ CRÉER MARKETPLACE (Page Marché Marchand)

### **Nouveau fichier** : `/src/app/components/marchand/MarcheVirtuel.tsx`

```tsx
import React, { useState } from 'react';
import { useRecolte } from '../../contexts/RecolteContext';
import { useCommande } from '../../contexts/CommandeContext';
import { RecolteStatus } from '../../types/julaba.types';

export function MarcheVirtuel() {
  const { getRecoltesEnLigne } = useRecolte();
  const { creerCommandeMarketplace } = useCommande();
  const { user } = useApp();
  
  const [onglet, setOnglet] = useState<'producteurs' | 'cooperatives'>('producteurs');
  
  const recoltesDisponibles = getRecoltesEnLigne();
  
  const handleAcheter = async (recolteId: string, quantite: number) => {
    await creerCommandeMarketplace(
      user!.id,
      `${user!.firstName} ${user!.lastName}`,
      'marchand',
      recolteId,
      quantite
    );
    
    // TODO: Décrement stock récolte
  };
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b p-4">
        <h1 className="text-xl font-bold mb-4">Marché virtuel JULABA</h1>
        
        {/* Onglets */}
        <div className="flex gap-2">
          <button
            onClick={() => setOnglet('producteurs')}
            className={`flex-1 py-2 rounded-lg font-medium ${
              onglet === 'producteurs' 
                ? 'bg-green-100 text-green-700' 
                : 'bg-gray-100'
            }`}
          >
            🌾 Producteurs
          </button>
          <button
            onClick={() => setOnglet('cooperatives')}
            className={`flex-1 py-2 rounded-lg font-medium ${
              onglet === 'cooperatives' 
                ? 'bg-blue-100 text-blue-700' 
                : 'bg-gray-100'
            }`}
          >
            🏢 Coopératives
          </button>
        </div>
      </div>
      
      {/* Liste produits */}
      <div className="p-4 grid grid-cols-2 gap-4">
        {recoltesDisponibles.map(recolte => (
          <div key={recolte.id} className="bg-white rounded-2xl p-4 shadow-sm">
            <img 
              src={recolte.photos?.[0] || '/placeholder-product.png'} 
              alt={recolte.produit}
              className="w-full h-32 object-cover rounded-lg mb-3"
            />
            
            <h3 className="font-medium text-gray-900 mb-1">{recolte.produit}</h3>
            <p className="text-xs text-gray-500 mb-2">{recolte.producteurName}</p>
            
            <div className="flex items-baseline gap-1 mb-2">
              <span className="text-lg font-bold text-green-600">
                {recolte.prixUnitaire}
              </span>
              <span className="text-xs text-gray-500">FCFA/kg</span>
            </div>
            
            <p className="text-xs text-gray-500 mb-3">
              {recolte.stockRestant} kg disponible
            </p>
            
            <button
              onClick={() => handleAcheter(recolte.id, 10)}
              className="w-full bg-green-600 text-white py-2 rounded-lg text-sm font-medium"
            >
              Acheter
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
```

---

## 6️⃣ RECALCULER SCORE AUTOMATIQUEMENT

### **Après chaque action importante, ajouter** :

```tsx
import { useScore } from '../../contexts/ScoreContext';

function MonComposant() {
  const { recalculerScore } = useScore();
  const { user } = useApp();
  
  const handleActionMetier = async () => {
    // ... logique
    
    // Recalculer score
    await recalculerScore(user!.id);
  };
}
```

**Exemples** :
- Après création commande
- Après paiement
- Après publication récolte
- Après upload document
- Après transaction wallet

---

## 🎯 PROCHAINES PRIORITÉS

### **Phase immédiate (1-2 jours)**
1. Intégrer WalletCard dans tous les dashboards
2. Créer page MesCommandes (Marchand + Producteur)
3. Créer page MarcheVirtuel (Marchand)
4. Tester workflow complet commande end-to-end

### **Phase court terme (3-5 jours)**
5. Créer CooperativeContext (trésorerie, membres)
6. Page PublierRecolte (Producteur)
7. Institution Analytics (KPIs + graphiques)
8. Identificateur (géolocalisation + post-validation)

### **Phase moyen terme (1-2 semaines)**
9. Système de notifications push
10. Feedback/Rating system
11. Workflow litiges
12. Préparation migration Supabase

---

## 💡 TIPS & ASTUCES

### **1. Debugging facile**
```tsx
// Voir tous les événements audit
console.log('Audit trail:', useAudit().events);

// Voir toutes les commandes
console.log('Commandes:', useCommande().commandes);

// Voir score utilisateur
console.log('Score:', useScore().getScoreByUser(userId));
```

### **2. Reset data (développement)**
```tsx
// Dans la console browser
localStorage.clear();
location.reload();
```

### **3. Tester workflow complet**
```tsx
// 1. Créer utilisateurs mock (Marchand + Producteur)
// 2. Recharger wallet Marchand
// 3. Créer commande
// 4. Accepter (Producteur)
// 5. Payer (Marchand)
// 6. Livrer (Producteur)
// 7. Confirmer (Marchand)
// 8. Récupérer argent (Producteur)
```

---

**✅ Tu es maintenant prêt à intégrer tous les systèmes !**

**Questions ? Consulte** :
- `/DOCUMENTATION_TECHNIQUE_JULABA.md` pour détails techniques
- `/MISE_A_JOUR_PARCOURS_WALLET_COMMANDES.md` pour workflows UI
- `/src/app/types/julaba.types.ts` pour tous les types

**Bon courage ! 🚀**
