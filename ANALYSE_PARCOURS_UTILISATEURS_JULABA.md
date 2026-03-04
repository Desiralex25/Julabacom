# 📊 ANALYSE COMPLÈTE DES PARCOURS UTILISATEURS JULABA

**Date d'analyse** : Mars 2026  
**Version** : 1.0.0  
**Périmètre** : Analyse exhaustive des 5 profils utilisateurs

---

## 🎯 STRUCTURE GLOBALE DE LA PLATEFORME

### **5 Profils Utilisateurs Distincts**

| Profil | Couleur Primaire | Rôle Métier |
|--------|------------------|-------------|
| **Marchand** | `#C66A2C` (Orange) | Vente au détail, gestion de caisse |
| **Producteur** | `#2E8B57` (Vert) | Production agricole, déclaration récoltes |
| **Coopérative** | `#2072AF` (Bleu) | Gestion collective, achats/ventes groupés |
| **Identificateur** | `#9F8170` (Beige) | Validation des acteurs, terrain |
| **Institution/Admin** | `#712864` (Violet) | Supervision, analytics, gouvernance |

---

## 🔄 PARCOURS GLOBAL D'ONBOARDING

### **1. Point d'entrée unique : ONBOARDING**

**Route** : `/onboarding`  
**Composant** : `Onboarding.tsx`

#### **Flux séquentiel (4 écrans) :**

```
┌─────────────────────────────────────────────────┐
│ ÉCRAN -1 : SPLASH SCREEN                       │
│ - Logo JULABA animé                             │
│ - Démarrage automatique après 2s                │
└───────────────┬─────────────────────────────────┘
                │
                ↓
┌─────────────────────────────────────────────────┐
│ ÉCRAN 0 : BIENVENUE SUR JULABA                  │
│ - Image : Marché africain                       │
│ - Titre : "Jùlaba t'aide à bien gérer ton argent" │
│ - Bouton : Suivant / Passer                     │
│ - Icône : Écouter (synthèse vocale)            │
└───────────────┬─────────────────────────────────┘
                │
                ↓
┌─────────────────────────────────────────────────┐
│ ÉCRAN 1 : ACHETEZ ET VENDEZ                     │
│ - Image : Commerce offline                       │
│ - Message : "Tu vends. Tu vois ce que tu gagnes" │
└───────────────┬─────────────────────────────────┘
                │
                ↓
┌─────────────────────────────────────────────────┐
│ ÉCRAN 2 : TANTIE SAGESSE                        │
│ - Image : Assistante vocale                     │
│ - Description : Assistant vocal intelligent      │
│ - Support en français (Nouchi inclus)           │
└───────────────┬─────────────────────────────────┘
                │
                ↓
┌─────────────────────────────────────────────────┐
│ ÉCRAN 3 : COTISATIONS SOCIALES                  │
│ - Gestion CNPS + CMU                             │
│ - Sécurité sociale intégrée                     │
└───────────────┬─────────────────────────────────┘
                │
                ↓
        Navigate('/login')
```

#### **Caractéristiques techniques** :
- ✅ **Animations Motion/React** : Transitions fluides entre écrans
- ✅ **Synthèse vocale** : Chaque écran peut être lu à voix haute
- ✅ **Option "Passer"** : Skip onboarding à tout moment
- ✅ **LocalStorage** : Flag `julaba_skip_onboarding` pour ne pas revoir
- ✅ **Lien retour** : Bouton "Revoir le tutoriel" depuis Login

---

### **2. AUTHENTIFICATION**

**Route** : `/login`  
**Composant** : `Login.tsx`

#### **Flux d'authentification en 2 étapes :**

```
┌─────────────────────────────────────────────────┐
│ ÉTAPE 1 : SAISIE NUMÉRO DE TÉLÉPHONE            │
│                                                  │
│ Input : Format ivoirien (ex: 0707070707)        │
│ Validation : Recherche dans base mock           │
│                                                  │
│ ├─ Si numéro trouvé → ÉTAPE 2                   │
│ └─ Si non trouvé → Message + Bouton "S'inscrire"│
└───────────────┬─────────────────────────────────┘
                │
                ↓
┌─────────────────────────────────────────────────┐
│ ÉTAPE 2 : CODE OTP (4 CHIFFRES)                │
│                                                  │
│ 4 inputs séparés avec auto-focus                │
│ Code par défaut : 1234 (demo)                   │
│ Auto-validation quand 4 chiffres saisis         │
│                                                  │
│ ✅ Success → Redirection selon rôle             │
│ ❌ Erreur → Shake animation + message           │
└───────────────┬─────────────────────────────────┘
                │
                ↓
        Redirection automatique :
        ├─ Marchand → /marchand
        ├─ Producteur → /producteur
        ├─ Coopérative → /cooperative
        ├─ Identificateur → /identificateur
        └─ Institution → /institution
```

#### **Features avancées** :
- ✅ **Tantie Sagesse FAB** : Bouton flottant permanent
  - Clic → Lit le numéro ou code saisi
  - Animation pulsante
  - Bulle de texte avec message vocal

- ✅ **Mode développeur** :
  - Triple-clic sur le logo → Liste de tous les utilisateurs mock
  - Sélection rapide pour tests
  - Liste complète avec rôles + téléphones

- ✅ **Partenaires affichés** :
  - Logo Orange Money
  - Logo Ton Djè (NSIA)
  - Logo JULABA

- ✅ **Vocal integration** :
  - Accueil : "Bienvenue sur JULABA. Entre ton numéro de téléphone"
  - Erreur : Message d'erreur vocalisé
  - Succès : "Bienvenue [Prénom]. Ton djè est calé"

---

### **3. INSCRIPTION (Partiellement implémentée)**

**Route** : `/inscription`  
**Composant** : `Inscription.tsx`

**État** : Écran visible mais à finaliser  
**Redirection** : Bouton "Créer mon compte" apparaît si numéro non trouvé

---

## 📱 ARCHITECTURE DES PARCOURS PAR PROFIL

### **RÈGLE D'OR : HARMONISATION 100%**

> **Tous les profils partagent EXACTEMENT la même structure UI** :
> - ✅ Composant `RoleDashboard` unique
> - ✅ Navigation `AppLayout` uniforme
> - ✅ Bottom bar standardisée (4 items)
> - ✅ Seules différences : **Couleur primaire + Données métier**

---

## 1️⃣ PROFIL MARCHAND 🟠

**Couleur** : `#C66A2C` (Orange)  
**Base route** : `/marchand`  
**Layout** : `AppLayout`

### **NAVIGATION (Bottom Bar - 4 items)**

| Item | Route | Icône | Description |
|------|-------|-------|-------------|
| **Accueil** | `/marchand` | Home | Dashboard principal |
| **Marché** | `/marchand/marche` | Store | Marché virtuel |
| **Produits** | `/marchand/stock` | Package | Gestion stock |
| **Moi** | `/marchand/profil` | User | Profil utilisateur |

---

### **A. ÉCRAN HOME : Dashboard POS Complet**

**Route** : `/marchand` (index)  
**Composant** : `MarchandHome.tsx`

#### **Sections affichées** :

1. **Header de session**
   - 📅 Date du jour
   - 💰 État de la caisse (Fond de caisse actuel)
   - 🔓/🔒 Badge "Journée ouverte" ou "Journée fermée"

2. **KPIs du jour (2 grandes cartes)**
   - 📈 **Ventes du jour** (FCFA) - Vert
   - 💹 **Marge du jour** (FCFA) - Vert
   - Clic sur carte → Modal détails

3. **Actions principales (2 gros boutons)**
   - ✅ **"Je vends"** (Vert) → `/marchand/vendre`
   - ❌ **"Je dépense"** (Rouge) → `/marchand/depenses`

4. **Score JULABA**
   - Badge circulaire avec score (ex: 85/100)
   - Niveau : Bronze/Argent/Or/Platine
   - Clic → Modal détails du score

5. **Coach Mark** (si journée fermée)
   - Pulsing indicator sur "Ouvrir ma journée"
   - Message vocal automatique après 5s
   - Dismissible

#### **Modals disponibles depuis Home** :

| Modal | Trigger | Fonction |
|-------|---------|----------|
| **OpenDayModal** | Bouton "Ouvrir ma journée" | Saisir fond de caisse initial |
| **CloseDayModal** | Bouton "Fermer ma journée" | Récapitulatif + validation |
| **EditFondModal** | Modifier fond | Ajuster fond en cours de journée |
| **StatsVentesModal** | Clic sur carte Ventes | Détails ventes |
| **StatsMargeModal** | Clic sur carte Marge | Détails marge |
| **ScoreModal** | Clic sur badge score | Explication scoring |
| **ResumeModal** | Bouton "Résumé" | Vue d'ensemble journée |
| **VenteVocaleModal** | FAB Tantie Sagesse | Vente par commande vocale |

---

### **B. ÉCRAN VENDRE : Point de Vente (POS)**

**Routes** :
- `/marchand/vendre` - Formulaire de vente
- `/marchand/caisse` - Interface caisse complète (POSCaisse)

**Composants** :
- `VendreForm.tsx` - Formulaire simple
- `POSCaisse.tsx` - Interface POS complète

#### **Workflow de vente** :

```
┌─────────────────────────────────────────────────┐
│ 1. SÉLECTION PRODUIT                            │
│ - Liste déroulante ou recherche                 │
│ - Affichage : Nom + Prix unitaire               │
└───────────────┬─────────────────────────────────┘
                │
                ↓
┌─────────────────────────────────────────────────┐
│ 2. QUANTITÉ                                      │
│ - Input numérique ou compteur                   │
│ - Calcul automatique du total                   │
└───────────────┬─────────────────────────────────┘
                │
                ↓
┌─────────────────────────────────────────────────┐
│ 3. VALIDATION                                    │
│ - Calcul marge (si prix achat connu)            │
│ - Ajout à la caisse                              │
│ - Update stats temps réel                       │
│ - Message vocal de confirmation                 │
└───────────────┬─────────────────────────────────┘
                │
                ↓
┌─────────────────────────────────────────────────┐
│ 4. HISTORIQUE                                    │
│ - Transaction enregistrée                       │
│ - Disponible dans "Ventes passées"              │
└─────────────────────────────────────────────────┘
```

#### **POSCaisse (Interface caisse avancée)** :
- ✅ Calculatrice intégrée
- ✅ Panier multi-produits
- ✅ Remises et promotions
- ✅ Modes de paiement (Cash, Mobile Money)
- ✅ Impression ticket (si connecté)
- ✅ Historique temps réel

---

### **C. ÉCRAN DÉPENSES**

**Route** : `/marchand/depenses`  
**Composant** : `MarchandDepenses.tsx`

#### **Types de dépenses** :
- 🏪 Achat de marchandises
- 🚚 Transport
- 💡 Charges (électricité, eau, etc.)
- 👥 Personnel
- 🔧 Maintenance
- 📦 Autres

#### **Formulaire** :
```
┌─────────────────────────────────────────────────┐
│ Type de dépense : [Dropdown]                    │
│ Montant : [Input FCFA]                          │
│ Description : [Textarea optionnel]              │
│ Date : [Date picker - défaut aujourd'hui]       │
│                                                  │
│ [Bouton Enregistrer]                             │
└─────────────────────────────────────────────────┘
```

#### **Impact sur la caisse** :
- ✅ Déduction immédiate du solde
- ✅ Update de la marge nette
- ✅ Historique tracé
- ✅ Affichage dans résumé de journée

---

### **D. ÉCRAN MARCHÉ VIRTUEL**

**Route** : `/marchand/marche`  
**Composant** : `MarcheVirtuel.tsx`

#### **Fonctionnalités** :
- 📦 Catalogue de produits disponibles
- 🛒 Commande auprès de producteurs/coopératives
- 💬 Chat avec fournisseurs (Tantie Sagesse intermédiaire)
- 📊 Comparaison prix
- 🚚 Demande de livraison

**État actuel** : Interface de découverte, workflow de commande à finaliser

---

### **E. ÉCRAN GESTION STOCK**

**Route** : `/marchand/stock` ou `/marchand/produits`  
**Composant** : `GestionStock.tsx`

#### **Vue principale** :

| Produit | Stock actuel | Prix achat | Prix vente | Marge | Actions |
|---------|--------------|------------|------------|-------|---------|
| Tomate (kg) | 50 kg | 300 FCFA | 500 FCFA | 200 | ✏️ 🗑️ |
| Oignon (kg) | 30 kg | 250 FCFA | 400 FCFA | 150 | ✏️ 🗑️ |

#### **Actions** :
- ➕ Ajouter produit
- ✏️ Modifier produit (prix, stock)
- 🗑️ Supprimer produit
- 🔔 Alertes stock bas (seuil configurable)

#### **Calculs automatiques** :
- Valeur totale du stock
- Marge moyenne prévisionnelle
- Rotation des stocks

---

### **F. ÉCRAN PROFIL**

**Route** : `/marchand/profil`  
**Composant** : `MarchandProfil.tsx`

#### **Sections (Accordéons)** :

1. **📊 Statistiques rapides**
   - Total ventes (lifetime)
   - Total dépenses
   - Marge globale

2. **👤 Informations personnelles** (Collapsible)
   - Nom, Prénom
   - Téléphone
   - Marché d'activité
   - Zone géographique
   - Mode édition avec toggle

3. **📄 Documents administratifs** (Collapsible)
   - ✅ Carte d'identité (Vérifié) 🔒
   - ❌ Certification JULABA (Rejeté) ✏️
   - 🔴 Attestation d'activité (À compléter) ✏️
   - **4 états gérés** : Empty, Pending, Verified, Rejected
   - Clic → `DocumentModal` avec upload/gestion

4. **⚙️ Actions rapides**
   - 🔔 Notifications
   - 🔒 Sécurité (Code PIN à 4 chiffres)
   - 🌍 Langue
   - 🔐 Confidentialité

5. **🎴 Carte professionnelle JULABA**
   - Carte flippable (recto/verso)
   - Recto : Photo, Nom, Numéro marchand, Score
   - Verso : QR Code de vérification
   - Bouton "Télécharger" et "Partager"

6. **🚪 Déconnexion**
   - Bouton rouge
   - Confirmation vocale

---

### **G. AUTRES ÉCRANS MARCHAND**

| Route | Composant | Description |
|-------|-----------|-------------|
| `/marchand/ventes-passees` | `VentesPassees.tsx` | Historique toutes ventes |
| `/marchand/resume-caisse` | `ResumeCaisse.tsx` | Résumé détaillé de la caisse |

---

### **RÈGLES MÉTIER MARCHAND**

#### **1. Gestion de session (journée)** :
```typescript
État journée : {
  opened: boolean;
  fondCaisse: number;
  dateOuverture: string;
  dateFermeture?: string;
}
```

**Conditions** :
- ✅ **Journée fermée** → Vendre/Dépenser **désactivés**
- ✅ **Ouverture obligatoire** → Modal OpenDayModal pour saisir fond
- ✅ **Fermeture** → Récapitulatif + validation + archivage
- ✅ **Une seule session par jour**

#### **2. Calcul de la caisse** :
```
Caisse actuelle = Fond de caisse initial + Ventes - Dépenses
```

#### **3. Calcul de la marge** :
```
Marge = Ventes - (Achats + Dépenses)
```

#### **4. Score JULABA** :
Basé sur :
- Régularité des saisies
- Complétude du profil
- Documents validés
- Volume de transactions
- Fiabilité (pas d'anomalies)

Niveaux : Bronze (0-25) | Argent (26-50) | Or (51-75) | Platine (76-100)

---

## 2️⃣ PROFIL PRODUCTEUR 🟢

**Couleur** : `#2E8B57` (Vert)  
**Base route** : `/producteur`  
**Layout** : `AppLayout`

### **NAVIGATION (Bottom Bar - 4 items)**

| Item | Route | Icône | Description |
|------|-------|-------|-------------|
| **Accueil** | `/producteur` | Home | Dashboard principal |
| **Commandes** | `/producteur/commandes` | ShoppingCart | Commandes reçues |
| **Productions** | `/producteur/stocks` | Sprout | Stocks et récoltes |
| **Moi** | `/producteur/profil` | User | Profil |

---

### **A. ÉCRAN HOME : Dashboard Producteur**

**Route** : `/producteur` (index)  
**Composant** : `ProducteurHome.tsx`

#### **KPIs du jour** :
- 🌾 **Récoltes du jour** (kg)
- 💰 **Ventes du jour** (FCFA)

#### **Actions principales** :
- 🌱 **"J'ai récolté"** → `/producteur/declarer-recolte`
- 💵 **"J'ai vendu"** → `/producteur/vente`

---

### **B. DÉCLARATION DE RÉCOLTE**

**Route** : `/producteur/declarer-recolte`  
**Composant** : `RecolteForm.tsx`

#### **Formulaire** :
```
┌─────────────────────────────────────────────────┐
│ Produit cultivé : [Dropdown]                    │
│ - Tomate                                         │
│ - Oignon                                         │
│ - Piment                                         │
│ - Aubergine                                      │
│ - Autres...                                      │
│                                                  │
│ Quantité récoltée : [Input] kg                  │
│ Date de récolte : [Date picker]                 │
│ Qualité : [Excellent / Bon / Moyen]             │
│                                                  │
│ [Bouton Enregistrer]                             │
└─────────────────────────────────────────────────┘
```

#### **Impact** :
- ✅ Ajout au stock disponible
- ✅ Visible dans catalogue pour marchands/coopératives
- ✅ Historique tracé
- ✅ Statistiques mises à jour

---

### **C. GESTION DES COMMANDES**

**Route** : `/producteur/commandes`  
**Composant** : `Commandes.tsx`

#### **États de commande** :
- 🟠 **En attente** (nouvelles commandes)
- ✅ **Acceptées** (préparation en cours)
- 🚚 **En livraison**
- ✅ **Livrées** (complétées)
- ❌ **Refusées**

#### **Actions** :
- Accepter commande
- Refuser commande (avec raison)
- Marquer comme livrée
- Contacter le client (via Tantie Sagesse)

---

### **D. STOCKS ET PRODUCTIONS**

**Route** : `/producteur/stocks`  
**Composant** : `StocksWrapper.tsx` + `Stocks.tsx`

#### **Vue stock** :

| Produit | Stock dispo | Récolté ce mois | Vendu ce mois | Prix/kg |
|---------|-------------|-----------------|---------------|---------|
| Tomate | 120 kg | 450 kg | 330 kg | 400 FCFA |
| Oignon | 80 kg | 200 kg | 120 kg | 350 FCFA |

#### **Métriques** :
- Volume total disponible
- Taux de rotation
- Revenus prévisionnels

---

### **E. PROFIL PRODUCTEUR**

**Route** : `/producteur/profil` ou `/producteur/mon-profil`  
**Composants** : `ProducteurProfilHarmonise.tsx` + `Profil.tsx`

#### **Spécificités** :
- 🌾 Type de cultures
- 📍 Localisation des parcelles
- 🚜 Équipements disponibles
- 👥 Coopérative(s) d'appartenance
- 📄 Documents (même système que Marchand)

---

### **RÈGLES MÉTIER PRODUCTEUR**

1. **Stock automatique** :
   - Récolte déclarée → Stock augmente
   - Vente validée → Stock diminue

2. **Saisonnalité** :
   - Catalogue produits adapté selon saison
   - Alertes météo (à venir)

3. **Prix dynamiques** :
   - Prix suggéré basé sur marché
   - Historique prix pour comparaison

---

## 3️⃣ PROFIL COOPÉRATIVE 🔵

**Couleur** : `#2072AF` (Bleu)  
**Base route** : `/cooperative`  
**Layout** : `AppLayout`

### **NAVIGATION (Bottom Bar - 4 items)**

| Item | Route | Icône | Description |
|------|-------|-------|-------------|
| **Accueil** | `/cooperative` | Home | Dashboard |
| **Membres** | `/cooperative/membres` | Users | Gestion membres |
| **Stocks** | `/cooperative/stocks` | Package | Stocks groupés |
| **Moi** | `/cooperative/profil` | User | Profil |

---

### **A. ÉCRAN HOME : Dashboard Coopérative**

**Route** : `/cooperative` (index)  
**Composant** : `CooperativeHome.tsx`

#### **KPIs** :
- 📦 **Volume groupé** (kg total)
- 💰 **Transactions** (FCFA)

#### **Actions** :
- 🛒 **"Achats groupés"** → Voir achats collectifs
- 📤 **"Ventes groupées"** → Voir ventes groupées

---

### **B. GESTION DES MEMBRES**

**Route** : `/cooperative/membres`  
**Composant** : `Membres.tsx`

#### **Liste membres** :

| Membre | Rôle | Contributions | Statut | Actions |
|--------|------|---------------|--------|---------|
| Jean Koffi | Producteur | 450 kg | Actif | 👁️ ✏️ |
| Marie Koné | Productrice | 320 kg | Actif | 👁️ ✏️ |

#### **Actions** :
- ➕ Ajouter membre
- 👁️ Voir détails membre
- ✏️ Modifier membre
- 🗑️ Retirer membre (avec confirmation)
- 📊 Statistiques par membre

---

### **C. STOCKS COMMUNS**

**Route** : `/cooperative/stock` ou `/cooperative/stocks`  
**Composant** : `Stock.tsx`

#### **Agrégation** :
- Vue consolidée de tous les stocks membres
- Répartition par produit
- Traçabilité par membre

---

### **D. PROFIL COOPÉRATIVE**

**Route** : `/cooperative/profil`  
**Composant** : `CooperativeProfil.tsx`

#### **Informations** :
- Nom de la coopérative
- Président
- Nombre de membres
- Date de création
- Zone d'activité
- Agrément officiel
- Documents administratifs

---

### **RÈGLES MÉTIER COOPÉRATIVE**

1. **Mutualisation** :
   - Achats en gros → Prix réduits
   - Ventes groupées → Meilleur pouvoir de négociation

2. **Répartition** :
   - Clé de répartition selon contributions
   - Historique transparent

3. **Gouvernance** :
   - Rôles : Président, Trésorier, Secrétaire, Membres
   - Validation actions importantes (vote)

---

## 4️⃣ PROFIL IDENTIFICATEUR 🟤

**Couleur** : `#9F8170` (Beige/Taupe)  
**Base route** : `/identificateur`  
**Layout** : `IdentificateurLayout` (spécifique)

### **NAVIGATION (Bottom Bar - 4 items)**

| Item | Route | Icône | Description |
|------|-------|-------|-------------|
| **Accueil** | `/identificateur` | Home | Dashboard |
| **Identifications** | `/identificateur/identifications` | UserCheck | Liste |
| **Rapports** | `/identificateur/rapports` | BarChart3 | Statistiques |
| **Moi** | `/identificateur/profil` | User | Profil |

---

### **A. ÉCRAN HOME : Dashboard Identificateur**

**Route** : `/identificateur` (index)  
**Composant** : `IdentificateurHome.tsx`

#### **KPIs du jour** :
- ✅ **Validations du jour** (nombre acteurs)
- ⏳ **En attente** (demandes à traiter)

#### **Actions principales** :
- ➕ **"Nouveau marchand"** → Formulaire identification marchand
- 🌱 **"Nouveau producteur"** → Formulaire identification producteur

---

### **B. WORKFLOW D'IDENTIFICATION MARCHAND**

**Routes** :
- `/identificateur/nouveau-marchand` - Point d'entrée
- `/identificateur/formulaire-identification-marchand` - Formulaire complet
- `/identificateur/fiche-marchand` - Récapitulatif

#### **Étapes** :

```
┌─────────────────────────────────────────────────┐
│ ÉTAPE 1 : INFORMATIONS PERSONNELLES             │
│ - Nom, Prénom                                    │
│ - Téléphone                                      │
│ - Commune, Quartier                              │
│ - Marché d'activité                              │
└───────────────┬─────────────────────────────────┘
                │
                ↓
┌─────────────────────────────────────────────────┐
│ ÉTAPE 2 : ACTIVITÉ COMMERCIALE                  │
│ - Type de commerce                               │
│ - Produits vendus (multi-sélection)              │
│ - Ancienneté dans le commerce                   │
│ - Emplacement fixe ou ambulant                  │
└───────────────┬─────────────────────────────────┘
                │
                ↓
┌─────────────────────────────────────────────────┐
│ ÉTAPE 3 : DOCUMENTS                              │
│ - Photo carte d'identité                         │
│ - Photo du marchand                              │
│ - Photo de l'emplacement commercial              │
│ - Capture via caméra ou upload                  │
└───────────────┬─────────────────────────────────┘
                │
                ↓
┌─────────────────────────────────────────────────┐
│ ÉTAPE 4 : VALIDATION                             │
│ - Récapitulatif complet                          │
│ - Vérification données                           │
│ - Signature numérique identificateur             │
│ - Envoi pour validation finale                  │
└───────────────┬─────────────────────────────────┘
                │
                ↓
┌─────────────────────────────────────────────────┐
│ RÉSULTAT : FICHE MARCHAND CRÉÉE                 │
│ - Numéro unique JULABA généré                    │
│ - Compte en attente d'activation                │
│ - SMS envoyé au marchand avec identifiants      │
└─────────────────────────────────────────────────┘
```

**Composants** :
- `NouveauMarchand.tsx` - Écran de choix
- `FormulaireIdentificationMarchand.tsx` - Formulaire multi-étapes
- `FicheMarchand.tsx` - Fiche récapitulative

---

### **C. LISTE DES IDENTIFICATIONS**

**Route** : `/identificateur/identifications`  
**Composant** : `Identifications.tsx`

#### **Vues** :
- 📋 **Toutes** les identifications
- ⏳ **En attente** de validation admin
- ✅ **Validées**
- ❌ **Rejetées**

#### **Filtres** :
- Par date
- Par marché
- Par type d'acteur
- Par statut

---

### **D. RAPPORTS ET STATISTIQUES**

**Route** : `/identificateur/rapports`  
**Composant** : `Rapports.tsx`

#### **Métriques** :
- Nombre d'identifications par jour/semaine/mois
- Taux de validation
- Répartition géographique
- Types d'acteurs identifiés

---

### **E. PROFIL IDENTIFICATEUR**

**Route** : `/identificateur/profil`  
**Composant** : `IdentificateurProfil.tsx`

#### **Informations** :
- Zone d'affectation
- Marché(s) couverts
- Performance (nombre d'identifications)
- Documents (badge, accréditation)

---

### **RÈGLES MÉTIER IDENTIFICATEUR**

1. **Validation terrain** :
   - Vérification physique obligatoire
   - Photos géolocalisées
   - Signature numérique horodatée

2. **Quota/Performance** :
   - Objectifs mensuels d'identification
   - Prime selon performance

3. **Documents requis** :
   - Carte d'identité (obligatoire)
   - Photo acteur (obligatoire)
   - Photo emplacement (optionnel mais recommandé)

4. **Workflow de validation** :
```
Identificateur crée fiche → En attente
                          ↓
Admin/Institution valide → Compte activé
                          OU
Admin/Institution rejette → Retour identificateur
```

---

## 5️⃣ PROFIL INSTITUTION/ADMIN 🟣

**Couleur** : `#712864` (Violet)  
**Base route** : `/institution`  
**Layout** : `AppLayout` + route spéciale `/institution/dashboard`

### **NAVIGATION (Bottom Bar - 4 items)**

| Item | Route | Icône | Description |
|------|-------|-------|-------------|
| **Accueil** | `/institution` | Home | Dashboard mobile |
| **Analytics** | `/institution/analytics` | BarChart3 | Statistiques |
| **Acteurs** | `/institution/acteurs` | Users | Gestion utilisateurs |
| **Moi** | `/institution/profil` | User | Profil |

---

### **A. ÉCRAN HOME : Dashboard Institution**

**Route** : `/institution` (index)  
**Composant** : `InstitutionHome.tsx`

#### **KPIs globaux** :
- 👥 **Utilisateurs actifs** (total)
- 💰 **Volume total** (FCFA)

#### **Actions** :
- 👥 **"Gestion utilisateurs"** → Liste complète
- 📊 **"Analytics"** → Tableaux de bord détaillés

---

### **B. DASHBOARD DESKTOP (Full Screen)**

**Route** : `/institution/dashboard`  
**Composant** : `Dashboard.tsx`

#### **Layout complet** :
- 📊 Graphiques temps réel (Recharts)
- 🗺️ Carte de Côte d'Ivoire avec données géolocalisées
- 📈 Tendances et prévisions
- 🎯 KPIs stratégiques
- 📅 Calendrier événements
- ⚠️ Alertes et anomalies

**Note** : Vue desktop, non responsive mobile

---

### **C. ANALYTICS**

**Route** : `/institution/analytics`  
**Composant** : `Analytics.tsx`

#### **Vues disponibles** :
- Volume de transactions par région
- Répartition par type d'acteur
- Croissance mensuelle
- Produits les plus échangés
- Top marchés
- Performance identificateurs

---

### **D. GESTION DES ACTEURS**

**Route** : `/institution/acteurs`  
**Composant** : `Acteurs.tsx`

#### **Fonctionnalités** :
- 📋 Liste complète tous utilisateurs
- 🔍 Recherche et filtres avancés
- 👁️ Vue détaillée d'un acteur
- ✏️ Modification profil
- 🔒 Suspension/Activation compte
- 🗑️ Suppression (avec confirmation)
- ✅ Validation identifications en attente

#### **Filtres** :
- Par rôle (Marchand, Producteur, etc.)
- Par région
- Par statut (Actif, Suspendu, En attente)
- Par score JULABA
- Par date d'inscription

---

### **E. PROFIL INSTITUTION**

**Route** : `/institution/profil`  
**Composant** : `InstitutionProfil.tsx`

#### **Informations** :
- Nom de l'institution
- Responsable
- Périmètre de supervision
- Documents officiels
- Paramètres plateforme

---

### **RÈGLES MÉTIER INSTITUTION**

1. **Supervision globale** :
   - Vue d'ensemble de toute l'activité
   - Pouvoir de validation/rejet
   - Gestion des rôles et permissions

2. **Analytics en temps réel** :
   - Tableaux de bord actualisés
   - Exports de données
   - Rapports personnalisés

3. **Gouvernance** :
   - Paramétrage de la plateforme
   - Gestion des référentiels (produits, marchés, zones)
   - Modération et sécurité

---

## 🎨 SYSTÈME DE DESIGN PARTAGÉ

### **1. COMPOSANTS UI COMMUNS**

Tous disponibles dans `/src/app/components/ui/` :

- **Button** - Boutons standardisés
- **Input** - Champs de saisie
- **Counter** - Compteur numérique
- **Modals** - Modals réutilisables
- **Cards** - Cartes de données
- **Forms** - Formulaires

### **2. COMPOSANTS SHARED**

Disponibles dans `/src/app/components/shared/` :

- **RoleDashboard** - Dashboard générique pour tous les rôles
- **CompactProfileCard** - Carte profil compacte
- **Navigation** - Bottom bar standardisée

### **3. LAYOUT COMMUN**

**Composant** : `AppLayout.tsx`

Structure :
```
┌─────────────────────────────────────────────────┐
│ HEADER (optionnel)                              │
├─────────────────────────────────────────────────┤
│                                                  │
│                                                  │
│         CONTENU PRINCIPAL                        │
│         (Outlet pour les routes)                │
│                                                  │
│                                                  │
├─────────────────────────────────────────────────┤
│ BOTTOM NAVIGATION BAR (4 items)                 │
│ [Accueil] [Action1] [Action2] [Profil]          │
└─────────────────────────────────────────────────┘
```

---

## 🗣️ TANTIE SAGESSE : ASSISTANT VOCAL UNIVERSEL

### **Présence constante**

**Composant** : `TantieSagesse.tsx`  
**Position** : FAB (Floating Action Button) en bas à droite

#### **Fonctionnalités** :

1. **Synthèse vocale** :
   - Lecture de tous les messages
   - Voix française (Nouchi supporté)
   - Contrôle volume et débit

2. **Reconnaissance vocale** :
   - Commandes vocales
   - Saisie par voix
   - Vente vocale (Marchand)

3. **Contexte intelligent** :
   - Messages adaptés à l'écran
   - Aide contextuelle
   - Suggestions proactives

#### **Exemples de commandes** :
- "Je veux vendre 5 tomates"
- "Combien j'ai dans ma caisse ?"
- "Ouvre ma journée"
- "Montre mes ventes du jour"

---

## 🔐 SÉCURITÉ ET AUTHENTIFICATION

### **1. Code de sécurité à 4 chiffres**

**Composant** : `SecurityCodeModal.tsx`

**Usage** :
- Confirmation suppression de document
- Validation actions sensibles
- Optionnel (activable par utilisateur)

### **2. Session management**

- Token JWT (prévu pour intégration backend)
- Expiration session après inactivité
- Déconnexion automatique

### **3. Niveaux de permissions**

| Rôle | Permissions |
|------|-------------|
| **Marchand** | Ses propres données uniquement |
| **Producteur** | Ses propres données + visibilité catalogue |
| **Coopérative** | Données membres + stocks communs |
| **Identificateur** | Création comptes + validation terrain |
| **Institution** | Toutes données + administration |

---

## 📊 CONTEXTES GLOBAUX (State Management)

### **1. AppContext**

**Fichier** : `/src/app/contexts/AppContext.tsx`

**Gère** :
- ✅ Utilisateur connecté
- ✅ Session de caisse (pour Marchand)
- ✅ Fonction `speak()` globale
- ✅ Stats du jour (getTodayStats)
- ✅ Mock users pour démo

### **2. UserContext**

**Fichier** : `/src/app/contexts/UserContext.tsx`

**Gère** :
- ✅ Profil utilisateur détaillé
- ✅ Mise à jour profil
- ✅ Documents administratifs
- ✅ Préférences utilisateur

### **3. CaisseContext**

**Fichier** : `/src/app/contexts/CaisseContext.tsx`

**Spécifique Marchand** :
- ✅ Fond de caisse
- ✅ Ventes en cours
- ✅ Dépenses
- ✅ Calculs temps réel (caisse, marge)
- ✅ Historique transactions

### **4. StockContext**

**Fichier** : `/src/app/contexts/StockContext.tsx`

**Pour Marchand et Producteur** :
- ✅ Gestion du stock
- ✅ Produits disponibles
- ✅ Alertes stock bas
- ✅ Valorisation stock

---

## 📱 TRANSITIONS ET RÈGLES DE NAVIGATION

### **Règles de redirection post-login** :

```typescript
if (user.role === 'marchand') → navigate('/marchand')
if (user.role === 'producteur') → navigate('/producteur')
if (user.role === 'cooperative') → navigate('/cooperative')
if (user.role === 'identificateur') → navigate('/identificateur')
if (user.role === 'institution') → navigate('/institution')
```

### **Conditions d'accès** :

1. **Journée ouverte (Marchand)** :
   - Si `currentSession.opened === false` :
     - Vendre → ❌ Désactivé
     - Dépenser → ❌ Désactivé
     - Coach mark → ✅ Affiché

2. **Documents validés** :
   - Profil incomplet → Badge "À compléter"
   - Accès complet après validation admin

3. **Score JULABA** :
   - Fonctionnalités premium débloquées selon niveau
   - Visibilité dans marketplace augmentée si score élevé

---

## 🎯 PARCOURS TYPES PAR PERSONA

### **PERSONA 1 : MARCHAND ASSA**

**Profil** : Vendeuse de légumes, Marché d'Adjamé, 35 ans

**Journée type** :
```
06:00 - Arrivée au marché
      → Login JULABA (téléphone + OTP)
      → Ouvrir ma journée (fond de caisse : 50 000 FCFA)

08:00 - Première vente
      → "Je vends" → Tomate 5kg × 500 FCFA = 2 500 FCFA
      → Tantie Sagesse : "Bravo Assa ! 2 500 francs dans ta caisse"

12:00 - Dépense
      → "Je dépense" → Transport 2 000 FCFA

18:00 - Fin de journée
      → "Fermer ma journée"
      → Récapitulatif :
         - Ventes : 45 000 FCFA
         - Dépenses : 5 000 FCFA
         - Marge : 40 000 FCFA
         - Caisse finale : 90 000 FCFA
      → Déconnexion
```

### **PERSONA 2 : PRODUCTEUR KOUASSI**

**Profil** : Producteur de tomates, Région de Yamoussoukro, 42 ans

**Workflow** :
```
Mardi matin - Récolte
      → Login JULABA
      → "J'ai récolté" → Tomate 150 kg

Mercredi - Commande reçue
      → Notification : "Coopérative Agnibilékrou : 80 kg tomates"
      → Accepter commande
      → Préparer livraison

Jeudi - Livraison
      → Marquer "Livrée"
      → Paiement enregistré automatiquement
      → Tantie Sagesse : "32 000 francs reçus !"
```

### **PERSONA 3 : IDENTIFICATEUR ADJOUA**

**Profil** : Identificatrice JULABA, Zone Yopougon, 28 ans

**Mission du jour** :
```
10:00 - Rendez-vous marchand
      → Ouvrir app JULABA
      → "Nouveau marchand"
      → Formulaire :
         - Nom : KONÉ Marie
         - Téléphone : 0707123456
         - Marché : Yopougon Siporex
         - Commerce : Vente de légumes
      → Photos : CI + Marchand + Emplacement
      → Signature numérique
      → Validation

11:00 - Envoi pour validation admin
      → Marie reçoit SMS : "Ton compte JULABA est en cours de validation"

14:00 - Statistiques
      → Voir rapports : 5 identifications cette semaine
      → Objectif mensuel : 15/20 ✅
```

---

## 📈 MÉTRIQUES ET ANALYTICS

### **KPIs suivis par profil**

| Profil | KPI 1 | KPI 2 | KPI 3 |
|--------|-------|-------|-------|
| **Marchand** | Ventes FCFA | Marge % | Rotation stock |
| **Producteur** | Volume récolté kg | CA FCFA | Taux satisfaction |
| **Coopérative** | Volume groupé kg | Nombre membres | Économies réalisées |
| **Identificateur** | Nb identifications | Taux validation | Temps moyen/identification |
| **Institution** | Utilisateurs actifs | Volume total FCFA | Croissance % |

---

## 🚀 FONCTIONNALITÉS AVANCÉES DÉJÀ IMPLÉMENTÉES

### **1. Système de documents (Scénario 4 états)**

Détaillé dans `/DOCUMENTATION_DOCUMENTS.md` :
- ✅ Empty (À compléter)
- ✅ Pending (En vérification)
- ✅ Verified (Certifié 🔒)
- ✅ Rejected (Refusé)

### **2. Carte professionnelle JULABA**

- ✅ Recto/Verso flippable
- ✅ QR Code unique
- ✅ Téléchargement et partage
- ✅ Niveau et score affichés

### **3. Notifications (Interface prête)**

**Composant** : `NotificationButton.tsx`

**Types de notifications** :
- 📬 Nouvelles commandes
- ✅ Documents validés
- ❌ Documents rejetés
- 💰 Paiements reçus
- ⚠️ Alertes stock
- 📊 Rapports hebdomadaires

### **4. Mode vocal complet**

- ✅ Vente vocale (Marchand)
- ✅ Lecture de tous les écrans
- ✅ Commandes vocales
- ✅ Feedback audio permanent

---

## 🎨 DESIGN TOKENS COMMUNS

### **Typographie**

- **Font family** : Inter
- **Tailles** :
  - Titre : 24px - 32px (bold)
  - Sous-titre : 18px - 20px (semibold)
  - Body : 14px - 16px (regular)
  - Caption : 12px (regular)

### **Espacements**

- Padding cards : 16px - 24px
- Gap entre éléments : 12px - 16px
- Margin sections : 24px - 32px

### **Border Radius**

- Boutons : `rounded-xl` (12px)
- Cards : `rounded-2xl` (16px) à `rounded-3xl` (24px)
- Modals : `rounded-3xl` (24px)

### **Ombres**

- Cards : `shadow-md`
- Modals : `shadow-lg`
- FAB : `shadow-xl`

---

## 🔮 FONCTIONNALITÉS EN COURS / À FINALISER

### **Identifiées dans le code comme "à implémenter"**

| Route | Statut |
|-------|--------|
| `/marchand/reglages` | Placeholder affiché |
| `/producteur/recoltes` | Placeholder affiché |
| `/cooperative/finances` | Placeholder affiché |
| `/institution/parametres` | Placeholder affiché |
| `/institution/transactions` | Non créé |

### **Workflows incomplets**

- ❌ Commande complète sur Marché Virtuel
- ❌ Paiement Mobile Money intégré
- ❌ Chat temps réel entre acteurs
- ❌ Livraison et logistique
- ❌ Intégration CNPS/CMU
- ❌ Exports de données (PDF, Excel)

---

## 📚 CONCLUSION : MATURITÉ DU PROJET

### **✅ TRÈS AVANCÉ (90-100%)**

- ✅ Profil **Marchand** : Système POS complet, fonctionnel
- ✅ Système de documents : 4 scénarios implémentés
- ✅ Authentification et onboarding
- ✅ Tantie Sagesse (vocal)
- ✅ Harmonisation UI 100%
- ✅ Routing et navigation

### **🟠 AVANCÉ (70-89%)**

- 🟠 Profil **Identificateur** : Formulaires présents, workflow complet
- 🟠 Profil **Institution** : Dashboard desktop + mobile
- 🟠 Contextes et state management

### **🟡 INTERMÉDIAIRE (40-69%)**

- 🟡 Profil **Producteur** : Bases présentes, à enrichir
- 🟡 Profil **Coopérative** : Structure présente, workflows à compléter
- 🟡 Marketplace : UI présente, interactions à finaliser

### **🔴 À DÉVELOPPER (<40%)**

- 🔴 Backend Supabase (tables, RLS, Storage)
- 🔴 Paiements réels (Mobile Money API)
- 🔴 Notifications push
- 🔴 Analytics avancés
- 🔴 Exports de données

---

## 📞 RESSOURCES TECHNIQUES

### **Fichiers clés à consulter**

- `/src/app/routes.tsx` - Toutes les routes
- `/src/app/config/roleConfig.ts` - Configuration rôles
- `/src/app/contexts/AppContext.tsx` - State global
- `/DOCUMENTATION_DOCUMENTS.md` - Système documents
- `/IMPLEMENTATION_SUMMARY.md` - Résumé technique

### **Composants réutilisables**

- `RoleDashboard` - Dashboard universel
- `DocumentModal` - Gestion documents
- `TantieSagesse` - Assistant vocal
- `Navigation` - Bottom bar

---

**FIN DE L'ANALYSE**

**Date** : Mars 2026  
**Analysé par** : IA Assistant  
**Version du projet** : 1.0.0
