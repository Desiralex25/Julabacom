# Mode Développement Jùlaba - Index Documentation

## 📖 Documentation disponible

### 🚀 Pour commencer (recommandé)

1. **[QUICK_START_DEV_MODE.md](/QUICK_START_DEV_MODE.md)**
   - Guide de démarrage rapide (30 secondes)
   - Activation/désactivation en 3 étapes
   - **LIRE EN PREMIER**

### 📚 Documentation complète

2. **[MODE_DEV_README.md](/MODE_DEV_README.md)**
   - Documentation complète du mode dev
   - Toutes les fonctionnalités
   - Configuration avancée
   - Dépannage

3. **[MODE_DEV_SUMMARY.md](/MODE_DEV_SUMMARY.md)**
   - Résumé complet de l'implémentation
   - Liste de tous les fichiers créés/modifiés
   - Architecture
   - Checklists

4. **[MODE_DEV_IMPLEMENTATION.md](/MODE_DEV_IMPLEMENTATION.md)**
   - Détails techniques de l'implémentation
   - Architecture des composants
   - Tests recommandés

### 🔧 Guides techniques

5. **[/src/app/config/MODE_DEV_GUIDE.md](/src/app/config/MODE_DEV_GUIDE.md)**
   - Guide ultra-rapide
   - 1 fichier, 1 variable

6. **[/src/app/config/DEV_MODE_INTEGRATION_GUIDE.md](/src/app/config/DEV_MODE_INTEGRATION_GUIDE.md)**
   - Comment intégrer le mode dev dans les nouveaux contextes
   - Patterns et exemples de code
   - Checklist d'intégration
   - **POUR LES DÉVELOPPEURS**

---

## 🗂️ Fichiers clés

### Configuration
- `/src/app/config/devMode.ts` - **FICHIER PRINCIPAL**

### Composants
- `/src/app/components/DevModeBadge.tsx` - Badge top
- `/src/app/components/DevModeToggle.tsx` - Toggle bottom
- `/src/app/components/DevModeInfo.tsx` - Info réutilisable

### Pages
- `/src/app/pages/DevModeHome.tsx` - Page d'accueil mode dev

### Données
- `/src/app/data/devMockData.ts` - Données mock

### Contextes
- `/src/app/contexts/DevModeContext.tsx`
- `/src/app/contexts/DevContextWrapper.tsx`

### Hooks
- `/src/app/hooks/useDevMode.ts`

---

## 🎯 Quel document lire ?

### Je veux juste activer le mode dev
👉 **[QUICK_START_DEV_MODE.md](/QUICK_START_DEV_MODE.md)**

### Je veux comprendre comment ça fonctionne
👉 **[MODE_DEV_README.md](/MODE_DEV_README.md)**

### Je développe un nouveau contexte
👉 **[DEV_MODE_INTEGRATION_GUIDE.md](/src/app/config/DEV_MODE_INTEGRATION_GUIDE.md)**

### Je veux une vue d'ensemble complète
👉 **[MODE_DEV_SUMMARY.md](/MODE_DEV_SUMMARY.md)**

### Je veux les détails techniques
👉 **[MODE_DEV_IMPLEMENTATION.md](/MODE_DEV_IMPLEMENTATION.md)**

---

## ⚡ Quick Actions

| Action | Fichier à modifier | Valeur |
|--------|-------------------|--------|
| Activer mode dev | `/src/app/config/devMode.ts` | `DEV_MODE = true` |
| Désactiver mode dev | `/src/app/config/devMode.ts` | `DEV_MODE = false` |
| Modifier utilisateur mock | `/src/app/data/devMockData.ts` | `DEV_USER = {...}` |
| Ajouter données mock | `/src/app/data/devMockData.ts` | `DEV_EMPTY_DATA = {...}` |
| Masquer badge | `/src/app/config/devMode.ts` | `showDevBadge: false` |
| Désactiver logs | `/src/app/config/devMode.ts` | `verboseLogs: false` |

---

## 📊 État du mode dev

- ✅ **Statut** : 100% opérationnel
- ✅ **Documentation** : Complète (7 documents)
- ✅ **Fichiers créés** : 18 fichiers
- ✅ **Fichiers modifiés** : 3 fichiers
- ✅ **Tests** : OK
- ✅ **Production ready** : Oui (désactiver avant deploy)

---

## 🎓 Parcours d'apprentissage recommandé

### Niveau 1 : Utilisateur
1. Lire [QUICK_START_DEV_MODE.md](/QUICK_START_DEV_MODE.md)
2. Activer le mode dev
3. Naviguer dans l'application

### Niveau 2 : Développeur UI
1. Lire [MODE_DEV_README.md](/MODE_DEV_README.md)
2. Comprendre les données mock
3. Personnaliser l'utilisateur mock si besoin

### Niveau 3 : Développeur Backend
1. Lire [DEV_MODE_INTEGRATION_GUIDE.md](/src/app/config/DEV_MODE_INTEGRATION_GUIDE.md)
2. Intégrer le mode dev dans vos nouveaux contextes
3. Créer des données mock avancées

### Niveau 4 : Architecte
1. Lire [MODE_DEV_IMPLEMENTATION.md](/MODE_DEV_IMPLEMENTATION.md)
2. Comprendre l'architecture complète
3. Étendre les fonctionnalités si nécessaire

---

## 🔗 Navigation rapide

- [Configuration principale](/src/app/config/devMode.ts) ⚙️
- [Page d'accueil dev](/src/app/pages/DevModeHome.tsx) 🏠
- [Données mock](/src/app/data/devMockData.ts) 📦
- [Guide intégration](/src/app/config/DEV_MODE_INTEGRATION_GUIDE.md) 📘

---

**Mode Développement Jùlaba - Documentation complète**
