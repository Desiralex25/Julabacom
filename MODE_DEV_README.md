# Mode Développement Jùlaba

## Description

Le mode développement permet de naviguer dans toutes les interfaces de Jùlaba **sans effectuer d'appels API** vers Supabase. C'est idéal pour :

- Tester la navigation et les routes
- Vérifier les interfaces utilisateur
- Développer de nouvelles fonctionnalités UI
- Faire des démonstrations sans backend
- Tester la réactivité et les animations

## Activation / Désactivation

### Activer le mode dev

Ouvrir le fichier `/src/app/config/devMode.ts` et mettre :

```typescript
export const DEV_MODE = true;
```

### Désactiver le mode dev (mode production)

```typescript
export const DEV_MODE = false;
```

## Fonctionnalités en mode dev

### ✅ Ce qui fonctionne

- Navigation complète entre toutes les pages
- Interfaces utilisateur 100% fonctionnelles
- Tous les composants visuels
- Animations et transitions
- Utilisateur mock automatiquement connecté
- Aucune erreur d'API

### ❌ Ce qui est désactivé

- Appels API vers Supabase
- Chargement de données réelles
- Synchronisation temps réel
- Sauvegarde des modifications
- Authentification réelle
- Notifications backend
- Tantie Sagesse (ElevenLabs)

## Structure des fichiers

```
/src/app/
  ├── config/
  │   └── devMode.ts              # Configuration principale du mode dev
  ├── contexts/
  │   ├── DevModeContext.tsx      # Context pour gérer le mode dev
  │   └── DevContextWrapper.tsx   # Wrapper qui court-circuite les API
  ├── data/
  │   └── devMockData.ts          # Données mock pour navigation
  ├── pages/
  │   └── DevModeHome.tsx         # Page d'accueil mode dev
  ├── components/
  │   └── DevModeBadge.tsx        # Badge visuel "MODE DEV"
  └── hooks/
      └── useDevMode.ts           # Hooks utilitaires pour mode dev
```

## Données Mock

L'utilisateur mock par défaut :

```typescript
{
  id: 'dev-user-001',
  phone: '0700000000',
  firstName: 'Utilisateur',
  lastName: 'Dev',
  role: 'marchand',
  region: 'Abidjan',
  commune: 'Cocody',
  // ... autres champs
}
```

## Utilisation dans les contextes

Les contextes détectent automatiquement le mode dev et court-circuitent les appels API :

```typescript
import { DEV_MODE, devLog } from '../config/devMode';

// Dans un useEffect
useEffect(() => {
  if (DEV_MODE) {
    devLog('MonContext', 'Chargement données ignoré en mode dev');
    return;
  }
  
  // Code normal avec appels API...
}, []);
```

## Configuration avancée

Dans `/src/app/config/devMode.ts` :

```typescript
export const DEV_CONFIG = {
  skipApiCalls: true,        // Désactiver les appels API
  skipAutoLoad: true,        // Désactiver le chargement auto
  skipRealtime: true,        // Désactiver temps réel
  skipNotifications: true,   // Désactiver notifications
  showDevBadge: true,        // Afficher le badge "MODE DEV"
  verboseLogs: true,         // Logs détaillés dans console
};
```

## Navigation

Quand le mode dev est activé, la page d'accueil (`/`) affiche le **DevModeHome** qui propose :

- Accès direct à tous les profils (Marchand, Producteur, Coopérative, etc.)
- Informations sur l'utilisateur mock
- Instructions d'utilisation
- Navigation simplifiée

## Logs

En mode dev, tous les appels API ignorés sont loggés dans la console :

```
[DEV MODE - AppContext] Chargement données mock en mode dev
[DEV MODE - API] Appel ignoré : /users/123
[DEV MODE - MUTATION] Mutation ignorée : /caisse/vente
```

## Bonnes pratiques

1. **Toujours désactiver le mode dev avant de déployer en production**
2. Ne jamais commiter avec `DEV_MODE = true`
3. Utiliser le mode dev pour le développement UI uniquement
4. Tester avec le backend réel avant de valider une feature
5. Vérifier que le badge "MODE DÉVELOPPEMENT" n'apparaît pas en production

## Dépannage

### Le mode dev ne s'active pas

- Vérifier que `DEV_MODE = true` dans `/src/app/config/devMode.ts`
- Relancer l'application
- Vider le cache navigateur

### Les données ne s'affichent pas

- Vérifier `/src/app/data/devMockData.ts`
- Les données par défaut sont vides, c'est normal
- Ajouter des données mock si nécessaire pour tester

### Erreurs en console

- Les erreurs API sont normales en mode dev
- Vérifier les logs `[DEV MODE - ...]` pour comprendre ce qui est ignoré

## Retour au mode normal

1. Ouvrir `/src/app/config/devMode.ts`
2. Changer `export const DEV_MODE = false;`
3. Relancer l'application
4. L'authentification normale reprend
