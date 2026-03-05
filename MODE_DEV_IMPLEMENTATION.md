# Implémentation du Mode Développement Jùlaba

## Résumé

Le mode développement est maintenant **100% opérationnel**. Il permet de naviguer dans toute l'application sans effectuer d'appels API vers Supabase.

## Fichiers créés

### Configuration
- `/src/app/config/devMode.ts` - Configuration principale (variable DEV_MODE)
- `/src/app/config/MODE_DEV_GUIDE.md` - Guide rapide

### Contexts
- `/src/app/contexts/DevModeContext.tsx` - Context pour gérer le mode dev
- `/src/app/contexts/DevContextWrapper.tsx` - Wrapper qui court-circuite les API

### Données Mock
- `/src/app/data/devMockData.ts` - Données mock minimales pour navigation

### Composants
- `/src/app/components/DevModeBadge.tsx` - Badge visuel "MODE DÉVELOPPEMENT"
- `/src/app/pages/DevModeHome.tsx` - Page d'accueil mode dev

### Hooks
- `/src/app/hooks/useDevMode.ts` - Hooks utilitaires

### Documentation
- `/MODE_DEV_README.md` - Documentation complète
- `/MODE_DEV_IMPLEMENTATION.md` - Ce fichier

## Fichiers modifiés

1. **`/src/app/App.tsx`**
   - Import des contextes DevMode
   - Wrapper DevModeProvider et DevContextWrapper
   - Ajout du DevModeBadge
   - Désactivation Tantie Sagesse en mode dev

2. **`/src/app/routes.tsx`**
   - Import de DevModeHome
   - Redirection vers DevModeHome si DEV_MODE = true

3. **`/src/app/contexts/AppContext.tsx`**
   - Import de DEV_MODE et devLog
   - Court-circuit dans loadUserData()
   - Court-circuit dans useEffect de session
   - Court-circuit dans addTransaction()

## Comment utiliser

### Activer le mode dev

Ouvrir `/src/app/config/devMode.ts` :

```typescript
export const DEV_MODE = true;
```

### Désactiver le mode dev

```typescript
export const DEV_MODE = false;
```

## Fonctionnalités

### ✅ Ce qui fonctionne en mode dev

- Navigation complète entre toutes les pages
- Toutes les interfaces utilisateur
- Animations et transitions
- Utilisateur mock connecté automatiquement
- Aucune erreur API
- Badge visuel "MODE DÉVELOPPEMENT"
- Page d'accueil avec accès rapide à tous les profils

### ❌ Ce qui est désactivé en mode dev

- Appels API vers Supabase
- Authentification réelle
- Sauvegarde des données
- Synchronisation temps réel
- Notifications backend
- Tantie Sagesse (ElevenLabs)

## Architecture

```
DevModeProvider (top-level)
  └─ DevContextWrapper
      └─ Tous les autres providers (AppProvider, UserProvider, etc.)
          └─ RouterProvider
              └─ DevModeBadge (badge visuel)
```

Chaque contexte vérifie `DEV_MODE` et court-circuite les appels API si activé.

## Utilisateur Mock

```typescript
{
  id: 'dev-user-001',
  phone: '0700000000',
  firstName: 'Utilisateur',
  lastName: 'Dev',
  role: 'marchand',
  region: 'Abidjan',
  commune: 'Cocody',
  market: 'Marché Test',
  score: 85,
  validated: true,
}
```

## Logs Console

En mode dev, la console affiche :

```
[DEV MODE - AppContext] Mode dev activé - Chargement utilisateur mock
[DEV MODE - AppContext] Chargement données mock en mode dev
[DEV MODE - API] Appel ignoré : /users/dev-user-001
```

## Tests

Pour tester le mode dev :

1. Activer le mode : `DEV_MODE = true`
2. Relancer l'application
3. Vérifier le badge orange en haut
4. Naviguer vers les différents profils
5. Vérifier qu'aucune erreur API n'apparaît
6. Confirmer que toutes les interfaces s'affichent

## Production

**IMPORTANT :** Avant de déployer en production :

1. Ouvrir `/src/app/config/devMode.ts`
2. Vérifier que `DEV_MODE = false`
3. Tester l'authentification
4. Vérifier qu'aucun badge "MODE DEV" n'apparaît

## Avantages

✅ Navigation rapide sans backend
✅ Tests UI sans données
✅ Développement frontend isolé
✅ Démonstrations sans configuration
✅ Pas d'erreurs API pendant le dev UI
✅ Toggle simple (1 variable)

## Extension future

Pour ajouter plus de données mock :

Modifier `/src/app/data/devMockData.ts` :

```typescript
export const DEV_EMPTY_DATA = {
  transactions: [
    // Ajouter des transactions mock ici
  ],
  // etc.
};
```

## Support

Pour toute question sur le mode dev :
1. Lire `/MODE_DEV_README.md`
2. Vérifier les logs console `[DEV MODE - ...]`
3. Vérifier que `DEV_MODE = true` dans `/src/app/config/devMode.ts`
