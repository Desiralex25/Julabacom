# 💰 CONFIGURATION WALLET JULABA - MULTI-PROFILS

## 📋 DOCUMENT DE RÉFÉRENCE POUR TOUS LES PROFILS

Ce document centralise TOUTES les modifications et configurations du Wallet JULABA.
**À consulter lors de la création de chaque nouveau profil.**

---

## 🎯 COMPOSANT RÉUTILISABLE PRINCIPAL

### Fichier : `/src/app/components/shared/ProfilWalletSection.tsx`

**Composant universel pour TOUS les profils JULABA :**
- ✅ Marchand (#C66A2C)
- ✅ Producteur (#2E8B57)  
- ✅ Coopérative (#2072AF)
- ✅ Institution (#712864)
- ✅ Identificateur (#9F8170)

### Utilisation dans un profil :

```tsx
import { ProfilWalletSection } from '../shared/ProfilWalletSection';

// Dans le composant Profil (exemple: ProducteurProfil.tsx)
<ProfilWalletSection 
  roleColor="#2E8B57"   // Couleur du rôle
  roleName="Producteur"  // Nom du rôle
  speak={speak}          // Fonction vocale
/>
```

---

## 🔧 CONFIGURATION PAR PROFIL

### 1️⃣ MARCHAND
```tsx
<ProfilWalletSection 
  roleColor="#C66A2C"
  roleName="Marchand"
  speak={speak}
/>
```

### 2️⃣ PRODUCTEUR
```tsx
<ProfilWalletSection 
  roleColor="#2E8B57"
  roleName="Producteur"
  speak={speak}
/>
```

### 3️⃣ COOPÉRATIVE
```tsx
<ProfilWalletSection 
  roleColor="#2072AF"
  roleName="Coopérative"
  speak={speak}
/>
```

### 4️⃣ INSTITUTION
```tsx
<ProfilWalletSection 
  roleColor="#712864"
  roleName="Institution"
  speak={speak}
/>
```

### 5️⃣ IDENTIFICATEUR
```tsx
<ProfilWalletSection 
  roleColor="#9F8170"
  roleName="Identificateur"
  speak={speak}
/>
```

---

## 📦 COMPOSANTS WALLET EXISTANTS

### 1. **WalletCard** - `/src/app/components/wallet/WalletCard.tsx`
**Carte principale du Wallet**
- ✅ Affichage du solde (masqué par défaut)
- ✅ Bouton œil pour afficher/masquer
- ✅ Expand pour voir les détails
- ✅ Solde disponible + Solde en attente (escrow)
- ✅ Boutons "Ajouter" et "Retirer"
- ✅ Logos Mobile Money (Orange, MTN, Moov, Wave)

**Props :**
```tsx
interface WalletCardProps {
  roleColor?: string; // Couleur du rôle (défaut: #2E8B57)
}
```

**État par défaut :**
- `showBalance`: `false` ⚠️ **Solde masqué par défaut pour sécurité**
- `isExpanded`: `false`

---

### 2. **RechargeWalletModal** - `/src/app/components/wallet/RechargeWalletModal.tsx`
**Modal de rechargement Mobile Money en 3 étapes**

**Étape 1 : Choix du montant**
- Input montant + boutons rapides (5000, 10000, 25000)
- Validation minimum 500 FCFA

**Étape 2 : Choix de l'opérateur**
- Orange Money (logo + couleur #FF7900)
- MTN Money (logo + couleur #FFCC00)
- Moov Money (logo + couleur #0099CC)
- Wave (logo + couleur #5A67D8)

**Étape 3 : Confirmation et instructions**
- Numéro à composer (ex: *144# pour Orange)
- Code de transaction simulé
- Timer 3 minutes
- Validation automatique

**Props :**
```tsx
interface RechargeWalletModalProps {
  isOpen: boolean;
  onClose: () => void;
  roleColor: string;
}
```

---

### 3. **WithdrawWalletModal** - `/src/app/components/wallet/WithdrawWalletModal.tsx`
**Modal de retrait Mobile Money en 3 étapes**

**Étape 1 : Choix du montant**
- Input montant + boutons rapides (5000, 10000, 25000)
- Validation solde disponible
- Frais de retrait calculés automatiquement :
  - 500-5000 FCFA : 100 FCFA
  - 5001-25000 FCFA : 200 FCFA
  - 25001-100000 FCFA : 500 FCFA
  - 100001+ FCFA : 1000 FCFA

**Étape 2 : Choix de l'opérateur + Numéro**
- Sélection opérateur (Orange, MTN, Moov, Wave)
- Input numéro de téléphone Mobile Money
- Validation format numéro ivoirien

**Étape 3 : Confirmation et validation**
- Récapitulatif complet
- Code PIN de sécurité (4 chiffres)
- Déduction automatique du solde

**Props :**
```tsx
interface WithdrawWalletModalProps {
  isOpen: boolean;
  onClose: () => void;
  roleColor: string;
}
```

---

## 🎨 DESIGN SYSTEM

### Couleurs des rôles
```typescript
const ROLE_COLORS = {
  marchand: '#C66A2C',
  producteur: '#2E8B57',
  cooperative: '#2072AF',
  institution: '#712864',
  identificateur: '#9F8170',
};
```

### Logos Mobile Money
```typescript
// Stockés dans /public/
orangeLogo: '/orange-money-logo.png'
mtnLogo: '/mtn-money-logo.png'
moovLogo: '/moov-money-logo.png'
waveLogo: '/wave-logo.png'
```

### Couleurs Mobile Money
```typescript
const OPERATOR_COLORS = {
  orange: '#FF7900',
  mtn: '#FFCC00',
  moov: '#0099CC',
  wave: '#5A67D8',
};
```

---

## 🔐 SÉCURITÉ

### Masquage du solde par défaut
```tsx
const [showBalance, setShowBalance] = useState(false); // ⚠️ false par défaut
```

### Code PIN pour retrait
- 4 chiffres obligatoires
- Validation avant retrait
- Feedback vocal

---

## 🗣️ FEEDBACK VOCAL

### Messages vocaux standards :
```typescript
// WalletCard
'Solde masqué' / 'Solde affiché'
'Mon argent fermé' / 'Mon argent ouvert'
'Ouvre le formulaire de rechargement Mobile Money'
'Ouvre le formulaire de retrait Mobile Money'

// ProfilWalletSection
'Ouverture du wallet Mobile Money'

// RechargeWalletModal
'Étape 1: Choisis le montant à ajouter'
'Étape 2: Choisis ton opérateur Mobile Money'
'Étape 3: Suis les instructions pour finaliser'
'Rechargement réussi de X francs CFA'

// WithdrawWalletModal
'Étape 1: Choisis le montant à retirer'
'Étape 2: Choisis l'opérateur et entre ton numéro'
'Étape 3: Confirme ton retrait'
'Retrait réussi de X francs CFA'
```

---

## 📍 POSITION DANS LE PROFIL

**Ordre recommandé pour tous les profils :**

```
1. Carte professionnelle JULABA
2. Fiche d'identification JULABA
3. Stats KPIs (2 colonnes)
4. Informations personnelles (accordéon)
5. 💰 WALLET (ProfilWalletSection) ← ICI
6. Activité du jour
7. Documents & Certifications
8. Paramètres
9. Sécurité & Confidentialité
```

**Delay d'animation :** `0.25s` (entre Infos personnelles et Activité)

---

## 🧪 CHECKLIST DE VALIDATION

Lors de l'implémentation dans un nouveau profil, vérifier :

- [ ] Import de `ProfilWalletSection`
- [ ] Couleur du rôle correcte
- [ ] Nom du rôle correct
- [ ] Fonction `speak` passée en props
- [ ] Position après "Informations personnelles"
- [ ] Animation delay = 0.25s
- [ ] Solde masqué par défaut au chargement
- [ ] Modal s'ouvre bien (slide-up)
- [ ] Bouton X ferme le modal
- [ ] WalletCard s'affiche avec la bonne couleur
- [ ] Boutons Ajouter/Retirer fonctionnels
- [ ] Modals de recharge/retrait opérationnels
- [ ] Feedback vocal actif
- [ ] Logos Mobile Money chargés
- [ ] Calcul des frais de retrait correct
- [ ] Validation du code PIN fonctionnelle

---

## 📝 EXEMPLE COMPLET D'IMPLÉMENTATION

### ProducteurProfil.tsx (à créer)

```tsx
import React, { useState } from 'react';
import { motion } from 'motion/react';
import { useApp } from '../../contexts/AppContext';
import { ProfilWalletSection } from '../shared/ProfilWalletSection';

export function ProducteurProfil() {
  const { speak } = useApp();

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="p-4 max-w-2xl mx-auto">
        {/* Header */}
        <h1>Mon Profil Producteur</h1>

        {/* Carte professionnelle */}
        {/* ... */}

        {/* Stats */}
        {/* ... */}

        {/* Informations personnelles */}
        {/* ... */}

        {/* 💰 WALLET - Section réutilisable */}
        <ProfilWalletSection 
          roleColor="#2E8B57"
          roleName="Producteur"
          speak={speak}
        />

        {/* Activité du jour */}
        {/* ... */}
      </div>
    </div>
  );
}
```

---

## 🎯 AVANTAGES DE CETTE ARCHITECTURE

✅ **DRY (Don't Repeat Yourself)**
- Code du Wallet écrit 1 fois
- Réutilisé 5 fois (5 profils)

✅ **Maintenance facile**
- Modification dans `ProfilWalletSection.tsx`
- Impact automatique sur tous les profils

✅ **Cohérence UX**
- Même expérience pour tous les rôles
- Seule la couleur change

✅ **Scalabilité**
- Ajout d'un nouveau profil = 3 lignes de code

---

## 🚀 PROCHAINES ÉTAPES

1. ✅ Marchand : **TERMINÉ**
2. ⏳ Producteur : Utiliser `ProfilWalletSection`
3. ⏳ Coopérative : Utiliser `ProfilWalletSection`
4. ⏳ Institution : Utiliser `ProfilWalletSection`
5. ⏳ Identificateur : Utiliser `ProfilWalletSection`

---

## 📞 CONTACT TECHNIQUE

**Composant créé le :** 1 Mars 2026  
**Développeur :** Claude (Assistant IA Figma Make)  
**Projet :** JULABA - Plateforme d'inclusion économique ivoirienne  

---

**🇨🇮 Fait avec ❤️ pour la Côte d'Ivoire**
