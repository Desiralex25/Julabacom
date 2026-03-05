# JULABA - Plateforme Nationale d'Inclusion Économique

**Tagline:** *"Ton djè est calé"*

---

## 🎯 Vue d'ensemble

JULABA est une plateforme nationale ivoirienne moderne d'inclusion économique des acteurs vivriers. Elle intègre une expérience mobile-first centrée sur la voix avec un dashboard institutionnel desktop pour le suivi national.

---

## 🎨 Identités visuelles par rôle

| Rôle | Couleur | Public |
|------|---------|--------|
| **Marchands vivriers** | `#C46210` (Orange) | Vendeurs de produits vivriers |
| **Producteurs agricoles** | `#00563B` (Vert) | Agriculteurs et cultivateurs |
| **Coopératives** | `#2072AF` (Bleu) | Organisations collectives |
| **Institutions** | `#702963` (Violet) | DGE, Ministères, ANSUT |

---

## 🔑 Fonctionnalités principales

### ✅ Authentification intelligente
- Saisie de numéro à 10 chiffres
- Validation OTP (SMS simulé)
- Attribution automatique du rôle
- **Mode Développeur** : Accès direct sans OTP pour la démo

### 🎙️ Assistant vocal "Tantie Sagesse"
- Bouton micro flottant permanent
- Commandes vocales pour toutes les actions
- Lecture à haute voix de toutes les informations
- Web Speech API (Chrome/Edge)
- Architecture prête pour IA vocale avancée

### 📱 Vues par rôle

#### 🟠 Marchand
- Enregistrer ventes (produit, quantité, prix, paiement)
- Ajouter dépenses (catégories: transport, achat, location, etc.)
- Score JULABA en temps réel
- Résumé financier quotidien
- Historique des transactions

#### 🟢 Producteur
- Déclarer récoltes (type culture, quantité, localisation)
- Mettre en vente sur marketplace
- Score JULABA
- Suivi production totale
- Statistiques par culture

#### 🔵 Coopérative
- Dashboard collectif
- Gestion des membres
- Performance globale
- Top producteurs du mois
- Chiffre d'affaires agrégé

#### 🟣 Institution
- Vue nationale avec KPIs
- Distribution par région
- Répartition par rôle
- Graphiques et analytics
- Accès au dashboard complet

### 🛒 Marketplace
- Produits disponibles en temps réel
- Filtres par région et produit
- Badges de fiabilité (score vendeur)
- Photos et informations détaillées
- Accessible à tous les rôles

### 📊 Dashboard Institutionnel (Desktop)
- Graphiques interactifs (Recharts)
- Évolution du volume national
- Répartition par rôle (Pie chart)
- Performance par région (Bar chart)
- Carte de Côte d'Ivoire (placeholder pour heatmap)
- Statistiques en temps réel

### 💾 Mode offline
- Stockage local (LocalStorage)
- Synchronisation automatique
- Badge "Mode hors ligne"
- Notification vocale lors reconnexion

### 💳 Scoring & Microcrédit
- Score basé sur activité
- Régularité des transactions
- Volume des ventes/récoltes
- Fiabilité
- Éligibilité au crédit

---

## 🏗️ Architecture technique

### Stack
- **React** 18.3.1
- **React Router** 7 (Data mode)
- **TypeScript**
- **Tailwind CSS** v4
- **Motion** (Framer Motion) pour animations
- **Recharts** pour graphiques
- **Lucide React** pour icônes
- **LocalStorage** pour persistance

### Structure
```
/src/app/
├── contexts/
│   └── AppContext.tsx          # State management global
├── components/
│   ├── auth/
│   │   ├── Splash.tsx          # Écran splash avec logo
│   │   └── Login.tsx           # Authentification + mode dev
│   ├── layout/
│   │   ├── Header.tsx          # Logos institutionnels
│   │   ├── BottomNav.tsx       # Navigation mobile
│   │   └── AppLayout.tsx       # Layout principal
│   ├── voice/
│   │   └── VoiceButton.tsx     # Assistant vocal
│   ├── marchand/
│   │   ├── MarchandHome.tsx
│   │   ├── VendreForm.tsx
│   │   └── DepenseForm.tsx
│   ├── producteur/
│   │   ├── ProducteurHome.tsx
│   │   └── RecolteForm.tsx
│   ├── cooperative/
│   │   └── CooperativeHome.tsx
│   ├── institution/
│   │   ├── InstitutionHome.tsx
│   │   └── Dashboard.tsx
│   └── marketplace/
│       └── Marketplace.tsx
├── routes.tsx                   # Configuration routing
└── App.tsx                      # Root component
```

---

## 🚀 Démarrage rapide

### Mode Développeur
1. Lancer l'application
2. Sur l'écran de connexion, cliquer sur l'icône `<Code />` en haut à droite
3. Sélectionner un profil prédéfini :
   - **Aminata Kouassi** - Marchand (0701020304)
   - **Konan Yao** - Producteur (0709080706)
   - **Marie Bamba** - Coopérative (0705040302)
   - **Jean Kouadio** - Institution (0707070707)

### Mode Normal
1. Entrer un numéro à 10 chiffres
2. Si reconnu : recevoir OTP (tout code 6 chiffres fonctionne en démo)
3. Si non reconnu : créer un compte

---

## 🎤 Commandes vocales exemples

### Marchand
- *"Tantie j'ai vendu 5 sacs de riz à 25000"*
- *"Tantie j'ai payé 10000 pour transport"*

### Producteur
- *"Tantie j'ai récolté 500 kg de maïs"*

### Navigation
- Cliquer sur le bouton micro pour activer
- Parler clairement
- Le système analyse et exécute

---

## 📦 Données mockées

### Utilisateurs de test
- 4 utilisateurs (1 par rôle)
- Scores entre 85-100
- Régions différentes (Abidjan, Bouaké, San Pedro)

### Marketplace
- 3 produits disponibles
- Prix réalistes en FCFA
- Vendeurs avec scores vérifiés

### Transactions
- Stockage local persistant
- Synchronisation en temps réel
- Historique illimité

---

## 🎨 Design System

### Couleurs de base (communes à tous)
```css
Background principal: #F8FAFC
Surface cards: #FFFFFF
Text primary: #111827
Text secondary: #6B7280
Border: #E5E7EB
Success: #16A34A
Warning: #F59E0B
Danger: #DC2626
```

### Typographie
- **Police:** Inter (Google Fonts)
- **Tailles:** Généreuses pour lisibilité mobile
- **Poids:** 400 (normal), 500 (medium), 600 (semibold), 700 (bold)

### Style
- Border radius: 12-24px (très arrondis)
- Ombres douces
- Animations fluides (Motion)
- Transitions 200-300ms

---

## 🔒 Logos institutionnels

Dans le header (ordre strict) :
1. Armoiries de Côte d'Ivoire
2. Logo DGE (Direction Générale de l'Économie)
3. Logo ANSUT

---

## 🌍 Responsive

- **Mobile-first** : Optimisé pour Android bas de gamme
- **Tablette** : Adaptatif
- **Desktop** : Dashboard institutionnel complet
- **Max-width:** 448px pour vues mobiles, full pour dashboard

---

## 📈 Évolutions futures

### Phase 2
- [ ] Intégration IA vocale avancée (NLP)
- [ ] Géolocalisation temps réel
- [ ] Paiements mobiles réels
- [ ] Notification push
- [ ] Chat entre acteurs

### Phase 3
- [ ] Backend Supabase complet
- [ ] API REST
- [ ] Authentification SMS réelle
- [ ] Microcrédit fonctionnel
- [ ] Carte interactive avec Leaflet/Mapbox

---

## 🛡️ Sécurité & Données

⚠️ **Important:** Cette version est une démo locale.

- Données stockées en LocalStorage (navigateur)
- Pas d'API backend réelle
- OTP simulé
- Pas de collecte PII

Pour production :
- Utiliser Supabase ou backend sécurisé
- Chiffrement des données sensibles
- Authentification forte (2FA)
- Conformité RGPD/protection données CI

---

## 📱 Compatibilité

### Navigateurs
- ✅ Chrome (recommandé pour voix)
- ✅ Edge (voix supportée)
- ⚠️ Firefox (voix limitée)
- ⚠️ Safari (pas de Web Speech API)

### Appareils
- ✅ Android 8+
- ✅ iOS 13+
- ✅ Desktop moderne

---

## 👥 Crédits

**JULABA** - Plateforme nationale ivoirienne
Direction Générale de l'Économie (DGE)
ANSUT
Ministère de l'Agriculture et du Développement Rural

---

## 📄 Licence

Propriété de l'État de Côte d'Ivoire
Tous droits réservés © 2024

---

## 👑 Back-Office Central (Super Admin)

### 🎯 Accès Rapide

**Créer le Super Admin** (une seule fois) :
```
https://julabacom.vercel.app/create-super-admin
```

**Se Connecter au Back-Office** :
```
https://julabacom.vercel.app/backoffice/login
```

### 📊 Les 14 Modules

Le Back-Office Central offre une vue d'ensemble complète de la plateforme :

| Module | Description |
|--------|-------------|
| 📊 **Dashboard** | Vue d'ensemble avec KPIs en temps réel |
| 👥 **Acteurs** | Gestion de tous les utilisateurs |
| 🏢 **Institutions** | Partenaires institutionnels |
| 📝 **Enrôlement** | Nouveaux enregistrements |
| 🔍 **Supervision** | Monitoring en temps réel |
| 🗺️ **Zones** | Gestion territoriale |
| 💰 **Commissions** | Système de rémunération |
| 🎓 **Academy** | Formation & contenus |
| 🎯 **Missions** | Gamification |
| 📊 **Rapports** | Analytics avancés |
| 🔔 **Notifications** | Centre de messages |
| 🛡️ **Audit** | Logs & traçabilité |
| 👤 **Profil** | Compte personnel |
| ⚙️ **Paramètres** | Configuration système |

### 🔐 Système RBAC (4 Rôles)

- **Super Admin** : Accès complet (100%)
- **Admin National** : Supervision nationale (~80%)
- **Gestionnaire de Zone** : Supervision régionale (~60%)
- **Analyste** : Consultation rapports (~40%)

### 📚 Documentation Complète

Pour plus de détails sur l'accès et la configuration du Back-Office :

- 🚀 **Démarrage rapide** : [`START_HERE.md`](/START_HERE.md)
- 📖 **Documentation complète** : [`INDEX_DOCUMENTATION.md`](/INDEX_DOCUMENTATION.md)
- 🏗️ **Architecture** : [`ARCHITECTURE_AUTH.md`](/ARCHITECTURE_AUTH.md)
- ✅ **Tests** : [`TESTING_CHECKLIST.md`](/TESTING_CHECKLIST.md)

### 🔒 Sécurité

- ✅ Authentification Supabase Auth
- ✅ Mots de passe cryptés (bcrypt)
- ✅ Tokens JWT sécurisés
- ✅ Limitation de tentatives (5 max)
- ✅ Audit trail complet

---

**Ton djè est calé** 🇨🇮
