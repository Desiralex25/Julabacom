# Quick Start - Mode Développement Jùlaba

## En 30 secondes

### Activer le mode dev

1. Ouvrir le fichier : `/src/app/config/devMode.ts`

2. Changer cette ligne :
   ```typescript
   export const DEV_MODE = true;
   ```

3. Relancer l'application

4. Vous verrez :
   - Badge orange "MODE DÉVELOPPEMENT" en haut
   - Page d'accueil avec tous les profils
   - Aucun appel API
   - Navigation libre

### Désactiver le mode dev

1. Ouvrir le fichier : `/src/app/config/devMode.ts`

2. Changer cette ligne :
   ```typescript
   export const DEV_MODE = false;
   ```

3. Relancer l'application

4. Retour au comportement normal (authentification, API, etc.)

## Ce que fait le mode dev

✅ Permet de naviguer dans TOUTES les interfaces sans backend
✅ Charge un utilisateur mock automatiquement
✅ Désactive tous les appels API
✅ Pas d'erreurs, navigation fluide
✅ Parfait pour tester l'UI et la navigation

## Documentation complète

- **Guide d'utilisation** : `/MODE_DEV_README.md`
- **Détails d'implémentation** : `/MODE_DEV_IMPLEMENTATION.md`
- **Intégration dans les contextes** : `/src/app/config/DEV_MODE_INTEGRATION_GUIDE.md`

## Fichiers importants

| Fichier | Description |
|---------|-------------|
| `/src/app/config/devMode.ts` | Configuration (1 variable à changer) |
| `/src/app/pages/DevModeHome.tsx` | Page d'accueil mode dev |
| `/src/app/components/DevModeBadge.tsx` | Badge visuel |
| `/src/app/data/devMockData.ts` | Données mock |

## Profils accessibles en mode dev

- 🛒 Marchand
- 🌾 Producteur
- 👥 Coopérative
- 🏢 Institution
- ✅ Identificateur
- 🔐 Back-Office (Super Admin)

## Utilisateur mock par défaut

```
Nom: Utilisateur Dev
Téléphone: 0700000000
Rôle: Marchand
Région: Abidjan
Commune: Cocody
```

## Rappels importants

⚠️ **AVANT PRODUCTION** : Vérifier que `DEV_MODE = false`

⚠️ **LOGS** : En mode dev, vérifier la console pour voir `[DEV MODE - ...]`

⚠️ **DONNÉES** : En mode dev, aucune donnée n'est sauvegardée

## Support

Questions ? Vérifier :
1. Que `DEV_MODE = true` dans `/src/app/config/devMode.ts`
2. Que l'application a été relancée
3. Les logs dans la console
4. La documentation complète dans `/MODE_DEV_README.md`

---

**C'est tout ! Un fichier, une variable, navigation complète. 🚀**
