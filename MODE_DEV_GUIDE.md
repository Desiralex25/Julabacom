# 🚀 MODE DÉVELOPPEUR - GUIDE D'UTILISATION

## ✅ STATUT : ACTIVÉ ET OPÉRATIONNEL

Le mode développeur de Jùlaba permet un accès rapide à tous les profils utilisateurs et au Back-Office **sans authentification**.

---

## 🎯 ACTIVATION

Le mode DEV est **automatiquement activé** sur les environnements suivants :
- ✅ `localhost`
- ✅ `127.0.0.1`
- ✅ `figma.site` (Figma Make)
- ✅ `makeproxy` (Figma Make proxy)

❌ **Désactivé automatiquement** sur :
- Production (vercel.app)
- Domaines personnalisés

---

## 🔘 ACCÈS AU MODE DEV

### Bouton flottant
Un **bouton violet** avec l'icône `<Code>` apparaît en **bas à droite** de l'écran.

**Position** : `fixed bottom-6 right-4 z-[9999]`

**Animations** :
- Apparition : Fade + Scale (délai 0.5s)
- Hover : Scale 1.1
- Tap : Scale 0.9

---

## 📋 FONCTIONNALITÉS

### Onglet 1 : ACTEURS JÙLABA (5 profils)

| Profil | Utilisateur | Région | Route | Icône | Couleur |
|--------|------------|--------|-------|-------|---------|
| **Commerçant** | Aminata Kouassi | Abidjan | `/marchand` | Store | #10B981 (vert) |
| **Producteur** | Konan Yao | Bouaké | `/producteur` | Leaf | #F59E0B (orange) |
| **Coopérative** | Marie Bamba | San Pedro | `/cooperative` | UsersRound | #8B5CF6 (violet) |
| **Institution** | Jean Kouadio | Abidjan | `/institution` | Building2 | #3B82F6 (bleu) |
| **Identificateur** | Sophie Diarra | Abidjan | `/identificateur` | Scan | #EC4899 (rose) |

### Onglet 2 : BACK-OFFICE (4 rôles RBAC)

| Rôle | Label | Description | Route | Icône | Couleur |
|------|-------|-------------|-------|-------|---------|
| `super_admin` | Super Admin | Accès total | `/backoffice/dashboard` | Crown | #E6A817 (or) |
| `admin_national` | Admin National | Gestion nationale | `/backoffice/dashboard` | Globe | #3B82F6 (bleu) |
| `gestionnaire_zone` | Gestionnaire Zone | Zone Abidjan | `/backoffice/dashboard` | MapPin | #10B981 (vert) |
| `analyste` | Analyste | Lecture seule | `/backoffice/dashboard` | BarChart3 | #8B5CF6 (violet) |

---

## 🔄 COMPORTEMENT

### Changement de profil (Acteurs Jùlaba)
```typescript
1. Click sur profil
2. Animation de chargement (350ms)
3. Mise à jour AppContext et UserContext
4. Navigation vers la route correspondante
5. Fermeture du modal
```

### Changement de rôle (Back-Office)
```typescript
1. Click sur rôle
2. Animation de chargement (350ms)
3. Mise à jour BackOfficeContext
4. Navigation vers /backoffice/dashboard
5. Fermeture du modal
```

---

## 💾 SOURCES DE DONNÉES

### Mock Users (Acteurs Jùlaba)
**Fichier** : `/src/app/data/mockUsers.ts`

**Export** : `DEV_MOCK_USERS`

**Fonctions** :
- `getMockUserByPhone(phone: string): User | null`
- `getAllMockUsers(): User[]`

### Mock BO Users (Back-Office)
**Fichier** : `/src/app/contexts/BackOfficeContext.tsx`

**Export** : `MOCK_BO_USERS`

---

## 🎨 DESIGN SYSTEM

### Modal
- **Largeur max** : 400px (max-w-md)
- **Bordure** : rounded-3xl
- **Hauteur contenu** : max-h-[60vh] overflow-y-auto
- **Backdrop** : bg-black/50 backdrop-blur-sm

### Boutons profils
- **Bordure** : border-2 rounded-2xl
- **Hover** : scale 1.02 + shadow-lg
- **Tap** : scale 0.98
- **Loading** : Bordure colorée + background transparent
- **Icône** : 40x40px, background `${color}20`

### Header
- **Gradient** : from-purple-600 to-purple-800
- **Texte** : "Mode Développeur" + "Accès rapide profils"

---

## ⚠️ IMPORTANT

### Production
Le composant **ne s'affiche PAS** en production :
```typescript
if (!isDevEnvironment) return null;
```

### Migration Supabase
Les mock users seront remplacés par de vrais utilisateurs Supabase lors de la Phase 2 de migration.

### Sécurité
❌ Ne **JAMAIS** activer ce mode en production  
✅ Détection automatique de l'environnement

---

## 🔧 MAINTENANCE

### Ajouter un profil
1. Ajouter l'utilisateur dans `DEV_MOCK_USERS`
2. Ajouter la couleur/icône dans `PROFILE_COLORS`
3. Ajouter la route dans `handleProfileSwitch`

### Ajouter un rôle BO
1. Ajouter l'utilisateur dans `MOCK_BO_USERS`
2. Ajouter le rôle dans `BO_ROLES`
3. Le reste est automatique

---

## 📦 DÉPENDANCES

```typescript
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router';
import { useApp } from '../../contexts/AppContext';
import { useUser } from '../../contexts/UserContext';
import { useBackOffice } from '../../contexts/BackOfficeContext';
import { DEV_MOCK_USERS } from '../../data/mockUsers';
```

---

**Créé le** : 5 mars 2026  
**Version** : 1.0.0  
**Statut** : ✅ Production Ready (DEV uniquement)
