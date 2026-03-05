# Mode Développement Jùlaba - ASCII Art Guide

```
 ╔═══════════════════════════════════════════════════════════════════╗
 ║                                                                   ║
 ║           🔧  MODE DÉVELOPPEMENT JÙLABA  ⚡                       ║
 ║                                                                   ║
 ║         Navigation complète sans backend en 30 secondes          ║
 ║                                                                   ║
 ╚═══════════════════════════════════════════════════════════════════╝
```

## Activation en 3 étapes

```
   ┌─────────────┐         ┌─────────────┐         ┌─────────────┐
   │   ÉTAPE 1   │         │   ÉTAPE 2   │         │   ÉTAPE 3   │
   │             │         │             │         │             │
   │   Ouvrir    │────────>│   Changer   │────────>│  Relancer   │
   │ devMode.ts  │         │DEV_MODE=true│         │     app     │
   │             │         │             │         │             │
   └─────────────┘         └─────────────┘         └─────────────┘
```

---

## Structure de l'application

```
                    ┌───────────────────────────────┐
                    │         Application           │
                    └──────────┬────────────────────┘
                               │
                    ┌──────────▼────────────────────┐
                    │     DevModeProvider           │
                    │  (Wrapper top-level)          │
                    └──────────┬────────────────────┘
                               │
                    ┌──────────▼────────────────────┐
                    │   DevContextWrapper           │
                    │  (Court-circuite les API)     │
                    └──────────┬────────────────────┘
                               │
        ┌──────────────────────┼──────────────────────┐
        │                      │                      │
   ┌────▼────┐          ┌─────▼─────┐         ┌─────▼─────┐
   │  Modal  │          │    App    │         │   User    │
   │Provider │          │ Provider  │         │ Provider  │
   └─────────┘          └───────────┘         └───────────┘
                               │
                    ┌──────────▼────────────────────┐
                    │    RouterProvider             │
                    │  (Navigation)                 │
                    └──────────┬────────────────────┘
                               │
        ┌──────────────────────┼──────────────────────┐
        │                      │                      │
   ┌────▼────┐          ┌─────▼─────┐         ┌─────▼─────┐
   │  Badge  │          │   Pages   │         │  Toggle   │
   │   Top   │          │           │         │  Bottom   │
   └─────────┘          └───────────┘         └───────────┘
```

---

## Flux de données

### Mode Normal (DEV_MODE = false)

```
  ┌──────────┐       ┌──────────┐       ┌──────────┐
  │          │       │          │       │          │
  │ Frontend │──────>│    API   │──────>│ Supabase │
  │          │<──────│          │<──────│          │
  │          │       │          │       │          │
  └──────────┘       └──────────┘       └──────────┘
       │
       │ Données réelles
       ▼
  ┌──────────┐
  │          │
  │    UI    │
  │          │
  └──────────┘
```

### Mode Dev (DEV_MODE = true)

```
  ┌──────────┐       ┌──────────┐       ┌──────────┐
  │          │   X   │          │   X   │          │
  │ Frontend │──X───>│    API   │──X───>│ Supabase │
  │          │   X   │          │   X   │          │
  │          │       │          │       │          │
  └──────────┘       └──────────┘       └──────────┘
       │
       │ Données mock
       ▼
  ┌──────────┐
  │          │
  │    UI    │ ← Navigation libre !
  │          │
  └──────────┘
```

---

## Page d'accueil DevModeHome

```
╔══════════════════════════════════════════════════════════════════╗
║                                                                  ║
║              🔧  MODE DÉVELOPPEMENT  ⚡                          ║
║                                                                  ║
║    Navigation libre sans données backend                        ║
║    Toutes les interfaces sont accessibles                       ║
║                                                                  ║
╠══════════════════════════════════════════════════════════════════╣
║                                                                  ║
║  👁️  Utilisateur actif                                          ║
║     Utilisateur Dev - marchand                                   ║
║     Région: Abidjan                                              ║
║                                                                  ║
╠══════════════════════════════════════════════════════════════════╣
║                                                                  ║
║  ┌────────────┐  ┌────────────┐  ┌────────────┐                ║
║  │    🛒      │  │    🌾      │  │    👥      │                ║
║  │  Marchand  │  │ Producteur │  │Coopérative │                ║
║  │            │  │            │  │            │                ║
║  │ Explorer → │  │ Explorer → │  │ Explorer → │                ║
║  └────────────┘  └────────────┘  └────────────┘                ║
║                                                                  ║
║  ┌────────────┐  ┌────────────┐  ┌────────────┐                ║
║  │    🏢      │  │    ✅      │  │    🔐      │                ║
║  │Institution │  │Identific.  │  │Back-Office │                ║
║  │            │  │            │  │            │                ║
║  │ Explorer → │  │ Explorer → │  │ Explorer → │                ║
║  └────────────┘  └────────────┘  └────────────┘                ║
║                                                                  ║
╠══════════════════════════════════════════════════════════════════╣
║                                                                  ║
║  ℹ️  Instructions Mode Dev                                       ║
║                                                                  ║
║  1️⃣  Toutes interfaces accessibles sans auth                    ║
║  2️⃣  Aucun appel API - Navigation pure UI                       ║
║  3️⃣  Données affichées = données mock minimales                 ║
║  4️⃣  Pour désactiver : /src/app/config/devMode.ts               ║
║                                                                  ║
╚══════════════════════════════════════════════════════════════════╝
```

---

## Badges visuels

### Badge Top (centre)

```
        ┌─────────────────────────────────────────┐
        │  🔧  MODE DÉVELOPPEMENT  ⚡            │
        └────────────┬────────────────────────────┘
                     │
        ┌────────────▼────────────────────────────┐
        │ Navigation sans données - Aucun appel API│
        └──────────────────────────────────────────┘
```

### Badge Bottom-Right (coin)

```
                                    ┌──────────────┐
                                    │  🔧 MODE DEV │
                                    │    ACTIF     │
                                    └──────┬───────┘
                                           │
                                    ┌──────▼───────┐
                                    │Pour désactiver│
                                    │  devMode.ts  │
                                    │DEV_MODE=false│
                                    └──────────────┘
```

---

## Comparaison mode normal vs mode dev

```
┌───────────────────────────────────────────────────────────────┐
│                     MODE NORMAL                               │
├───────────────────────────────────────────────────────────────┤
│                                                               │
│  Route /              → Page Login                            │
│  Authentification     → Requise                               │
│  Appels API           → Actifs                                │
│  Données              → Supabase                              │
│  Badge "MODE DEV"     → Caché                                 │
│  Logs console         → Normaux                               │
│                                                               │
└───────────────────────────────────────────────────────────────┘

                              VS

┌───────────────────────────────────────────────────────────────┐
│                     MODE DÉVELOPPEMENT                        │
├───────────────────────────────────────────────────────────────┤
│                                                               │
│  Route /              → DevModeHome                           │
│  Authentification     → Désactivée (auto-login)               │
│  Appels API           → Court-circuités                       │
│  Données              → Mock (vides)                          │
│  Badge "MODE DEV"     → Visible (orange)                      │
│  Logs console         → [DEV MODE - ...]                      │
│                                                               │
└───────────────────────────────────────────────────────────────┘
```

---

## Configuration

```
┌──────────────────────────────────────────────────────────────┐
│  Fichier : /src/app/config/devMode.ts                        │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  🔧 TOGGLE MODE DEV                                    │ │
│  │                                                        │ │
│  │  true  = Mode dev (navigation sans API)               │ │
│  │  false = Mode production (auth + Supabase)            │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│  export const DEV_MODE = true;  ← Changer ici               │
│                                                              │
│  export const DEV_CONFIG = {                                │
│    skipApiCalls: true,          ← Désactiver API            │
│    skipAutoLoad: true,          ← Pas de chargement auto    │
│    showDevBadge: true,          ← Afficher badge            │
│    verboseLogs: true,           ← Logs détaillés            │
│  };                                                          │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

---

## Workflow développeur

```
┌─────────────────────────────────────────────────────────────────┐
│                    WORKFLOW DÉVELOPPEUR                         │
└─────────────────────────────────────────────────────────────────┘

  1. Développement UI
     ┌────────────────────┐
     │ DEV_MODE = true    │
     │ Naviguer librement │
     │ Tester UI          │
     └────────┬───────────┘
              │
              ▼
  2. Test intégration
     ┌────────────────────┐
     │ DEV_MODE = false   │
     │ Tester avec API    │
     │ Vérifier backend   │
     └────────┬───────────┘
              │
              ▼
  3. Production
     ┌────────────────────┐
     │ DEV_MODE = false   │
     │ Déployer           │
     │ Vérifier checklist │
     └────────────────────┘
```

---

## Timeline de navigation

```
Utilisateur visite /
         │
         ▼
   DEV_MODE = true ?
         │
    ┌────┴────┐
    │         │
   Oui       Non
    │         │
    ▼         ▼
DevModeHome  Login
    │         │
    │    Auth requise
    │         │
    ▼         ▼
Profils    Dashboard
  │
  └─> Clic sur "Marchand"
         │
         ▼
    Interface Marchand
    (sans appels API)
         │
         ▼
    Navigation libre !
```

---

## Checklist visuelle

```
✅ INSTALLATION
   ├─ ✅ Fichiers créés (18)
   ├─ ✅ Fichiers modifiés (3)
   ├─ ✅ Documentation (8)
   └─ ✅ Tests prêts

✅ ACTIVATION
   ├─ ✅ Ouvrir devMode.ts
   ├─ ✅ Changer DEV_MODE = true
   ├─ ✅ Relancer app
   └─ ✅ Vérifier badge

✅ NAVIGATION
   ├─ ✅ Page d'accueil OK
   ├─ ✅ 6 profils accessibles
   ├─ ✅ Aucune erreur API
   └─ ✅ Navigation fluide

⚠️  PRODUCTION
   ├─ ⚠️  DEV_MODE = false
   ├─ ⚠️  Pas de badge
   ├─ ⚠️  Auth fonctionne
   └─ ⚠️  API actives
```

---

## Résumé en emoji

```
🔧 1 fichier        → /src/app/config/devMode.ts
🎯 1 variable       → DEV_MODE = true
⚡ 1 relance        → App redémarre
🚀 ∞ navigation     → Toutes les interfaces !

📦 18 fichiers      → Créés
✏️  3 fichiers      → Modifiés
📚 8 documents      → Documentation
✅ 100%             → Opérationnel
```

---

## Support visuel

```
┌──────────────────────────────────────────────────────────────┐
│  BESOIN D'AIDE ?                                             │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  📘 Guide rapide    → QUICK_START_DEV_MODE.md               │
│  📗 Doc complète    → MODE_DEV_README.md                    │
│  📙 Technique       → MODE_DEV_IMPLEMENTATION.md            │
│  📕 Résumé          → MODE_DEV_SUMMARY.md                   │
│  🎨 Visuel          → MODE_DEV_VISUAL_GUIDE.md              │
│  📋 Checklist       → MODE_DEV_CHECKLIST.md                 │
│  🔧 Intégration     → DEV_MODE_INTEGRATION_GUIDE.md         │
│  📑 Index           → MODE_DEV_INDEX.md                     │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

---

```
 ╔═══════════════════════════════════════════════════════════════════╗
 ║                                                                   ║
 ║              MODE DÉVELOPPEMENT JÙLABA                            ║
 ║                                                                   ║
 ║                 Simple · Rapide · Efficace                        ║
 ║                                                                   ║
 ║         1 fichier · 1 variable · Navigation complète             ║
 ║                                                                   ║
 ╚═══════════════════════════════════════════════════════════════════╝
```
