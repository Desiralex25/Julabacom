# Mode Développement Jùlaba - Guide Visuel

## 🎨 À quoi ressemble le mode dev ?

### 1. Badge en haut de l'écran

```
┌─────────────────────────────────────────────────┐
│                                                 │
│        🔧 MODE DÉVELOPPEMENT ⚡                 │
│                                                 │
│   Navigation sans données - Aucun appel API    │
│                                                 │
└─────────────────────────────────────────────────┘
```

**Couleurs** : Fond dégradé orange/jaune, texte blanc, animation rotation

---

### 2. Page d'accueil (route `/`)

```
┌─────────────────────────────────────────────────────────┐
│                                                         │
│         🔧 MODE DÉVELOPPEMENT ⚡                        │
│                                                         │
│   Navigation libre sans données backend -              │
│   Toutes les interfaces sont accessibles               │
│                                                         │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  👁️  Utilisateur actif                                 │
│     Utilisateur Dev - marchand                          │
│     Région: Abidjan                                     │
│                                                         │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐             │
│  │ 🛒       │  │ 🌾       │  │ 👥       │             │
│  │ Marchand │  │Producteur│  │Coopérative│            │
│  │          │  │          │  │          │             │
│  │ Explorer→│  │ Explorer→│  │ Explorer→│             │
│  └──────────┘  └──────────┘  └──────────┘             │
│                                                         │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐             │
│  │ 🏢       │  │ ✅       │  │ 🔐       │             │
│  │Institution│  │Identific.│  │Back-Office│           │
│  │          │  │          │  │          │             │
│  │ Explorer→│  │ Explorer→│  │ Explorer→│             │
│  └──────────┘  └──────────┘  └──────────┘             │
│                                                         │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ℹ️  Instructions Mode Dev                              │
│                                                         │
│  1️⃣  Toutes les interfaces accessibles sans auth       │
│  2️⃣  Aucun appel API - Navigation pure UI              │
│  3️⃣  Données affichées = données mock minimales        │
│  4️⃣  Pour désactiver : /src/app/config/devMode.ts      │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

### 3. Badge en bas à droite

```
                                          ┌──────────────┐
                                          │ 🔧 MODE DEV  │
                                          │   ACTIF      │
                                          └──────┬───────┘
                                                 │
                                          ┌──────▼───────┐
                                          │Pour désactiver│
                                          │  devMode.ts  │
                                          │DEV_MODE=false│
                                          └──────────────┘
```

---

### 4. Console Logs

Quand le mode dev est actif, vous verrez dans la console :

```
[DEV MODE - AppContext] Mode dev activé - Chargement utilisateur mock
[DEV MODE - AppContext] Chargement données mock en mode dev
[DEV MODE - DevContextWrapper] Mode dev activé - Tous les contextes utilisent des données vides
[DEV MODE - AppContext] Transaction ajoutée (mode dev - pas de sync)
[DEV MODE - API] Appel ignoré : /users/dev-user-001
```

---

## 🎬 Flux d'utilisation

### Scénario 1 : Activer le mode dev

```
1. Développeur                2. Fichier devMode.ts       3. Application
   │                              │                            │
   │ Ouvre                        │                            │
   │─────────────────────────────>│                            │
   │                              │                            │
   │ Change DEV_MODE = true       │                            │
   │─────────────────────────────>│                            │
   │                              │                            │
   │ Relance                      │                            │
   │──────────────────────────────────────────────────────────>│
   │                              │                            │
   │                              │            Badge "MODE DEV"│
   │<───────────────────────────────────────────────────────────
   │                              │                            │
   │                              │         Page DevModeHome   │
   │<───────────────────────────────────────────────────────────
```

### Scénario 2 : Navigation en mode dev

```
1. Utilisateur              2. DevModeHome              3. Interface Marchand
   │                            │                            │
   │ Visite /                   │                            │
   │───────────────────────────>│                            │
   │                            │                            │
   │ Voit tous les profils      │                            │
   │<───────────────────────────│                            │
   │                            │                            │
   │ Clique "Marchand"          │                            │
   │───────────────────────────>│                            │
   │                            │                            │
   │                            │ Redirect /marchand         │
   │                            │───────────────────────────>│
   │                            │                            │
   │                            │      Aucun appel API       │
   │                            │      Utilisateur mock      │
   │<─────────────────────────────────────────────────────────
   │                            │                            │
   │ Interface complète         │                            │
   │ sans données réelles       │                            │
```

---

## 🖼️ Comparaison visuelle

### Mode Normal (DEV_MODE = false)

```
┌─────────────────────────────────┐
│  🔐 JÙLABA - Connexion          │
│                                 │
│  📱 Numéro de téléphone         │
│  ┌───────────────────────────┐ │
│  │ 07XX XX XX XX             │ │
│  └───────────────────────────┘ │
│                                 │
│  🔒 Mot de passe               │
│  ┌───────────────────────────┐ │
│  │ ••••••••                  │ │
│  └───────────────────────────┘ │
│                                 │
│  [ Se connecter ]              │
│                                 │
└─────────────────────────────────┘

➡️ Authentification requise
➡️ Appels API actifs
➡️ Données Supabase
```

### Mode Dev (DEV_MODE = true)

```
┌─────────────────────────────────┐
│  🔧 MODE DÉVELOPPEMENT ⚡       │
└─────────────────────────────────┘

┌─────────────────────────────────┐
│  DevModeHome                    │
│                                 │
│  👁️ Utilisateur Dev            │
│                                 │
│  Profils disponibles :         │
│  🛒 Marchand                    │
│  🌾 Producteur                  │
│  👥 Coopérative                 │
│  🏢 Institution                 │
│  ✅ Identificateur              │
│  🔐 Back-Office                 │
│                                 │
└─────────────────────────────────┘

➡️ Pas d'authentification
➡️ Aucun appel API
➡️ Données mock
```

---

## 🎯 Indicateurs visuels

### Badge "MODE DEV" actif

| Emplacement | Couleur | Animation |
|-------------|---------|-----------|
| Top center | Orange→Amber | Rotation icône |
| Message | Jaune/Noir | Fade in |
| Bottom right | Noir/Jaune | Pulse |

### États

```
MODE DEV = true               MODE DEV = false
      ↓                              ↓
  🔶 Badge visible              ⚫ Pas de badge
  🔶 DevModeHome                ⚫ Page Login
  🔶 Logs [DEV MODE]            ⚫ Pas de logs dev
  🔶 Utilisateur mock           ⚫ Auth réelle
```

---

## 📱 Responsive

Le mode dev fonctionne sur tous les écrans :

### Mobile
```
┌────────────┐
│🔧 MODE DEV │
│            │
│  Profils   │
│  ↓         │
│ [Marchand] │
│ [Product.] │
│ [Coop.]    │
│            │
└────────────┘
```

### Tablet
```
┌──────────────────────┐
│   🔧 MODE DEV ⚡     │
│                      │
│  [Marchand][Product.]│
│  [Coop.]  [Institut.]│
│                      │
└──────────────────────┘
```

### Desktop
```
┌────────────────────────────────────┐
│       🔧 MODE DÉVELOPPEMENT ⚡     │
│                                    │
│ [Marchand] [Producteur] [Coop.]   │
│ [Instit.]  [Identif.]   [B.O.]    │
│                                    │
└────────────────────────────────────┘
```

---

## 🎨 Couleurs et styles

### Palette mode dev

```
Badge principal : #F59E0B → #F97316 (orange-500 → orange-600)
Texte badge    : #FFFFFF (white)
Message info   : #FEF3C7 (yellow-100)
Bordure info   : #FBBF24 (yellow-400)
Texte info     : #92400E (yellow-800)
Background     : #FFFBEB → #FFF7ED (yellow-50 → orange-50)
```

### Éléments UI

```css
.dev-badge {
  border-radius: 9999px;  /* rounded-full */
  border: 2px solid;       /* border-2 */
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
}

.dev-card {
  border-radius: 1.5rem;   /* rounded-3xl */
  border: 2px solid;       /* border-2 */
  transition: all 300ms;
}
```

---

**Mode Développement Jùlaba - Guide Visuel Complet**
