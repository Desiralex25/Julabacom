# 🔧 TROUBLESHOOTING - JÙLABA ACADEMY

## 🚨 Problèmes courants et solutions

---

## ❌ Problème : "Bouton Academy redirige vers Login"

### Symptôme
Quand je clique sur "JÙLABA Academy" dans un profil (producteur, coopérative, etc.), je suis redirigé vers `/login`.

### Cause
L'utilisateur stocké dans `localStorage` n'a pas le bon rôle. Le système pense que vous êtes "marchand" alors que vous naviguez dans un autre profil.

### Solution ✅
**Utilisez le ProfileSwitcher Dev Mode !**

1. Cherchez le **bouton violet en haut à droite** (icône Code)
2. Cliquez dessus
3. Sélectionnez le profil correspondant :
   - Producteur → **Konan Yao**
   - Coopérative → **Marie Bamba**
   - Institution → **Jean Kouadio**
   - Identificateur → **Sophie Diarra**
4. L'app change automatiquement le contexte utilisateur
5. Réessayez le bouton Academy → ✅ Fonctionne !

---

## ❌ Problème : "Bouton Dev Mode invisible"

### Symptôme
Je ne vois pas le bouton violet en haut à droite.

### Cause
Le ProfileSwitcher n'est visible qu'en localhost.

### Solution ✅
Vérifiez que vous êtes bien sur :
- `http://localhost:XXXX`
- `http://127.0.0.1:XXXX`

Si vous êtes sur un autre domaine (production, staging), le bouton ne s'affichera pas.

**Alternative** : Utilisez la page Login classique avec les numéros de téléphone :
- Marchand : `0701020304`
- Producteur : `0709080706`
- Coopérative : `0705040302`
- Institution : `0707070707`
- Identificateur : `0708080808`
- Code OTP : `1234`

---

## ❌ Problème : "Mauvaises formations affichées"

### Symptôme
Je suis connecté en tant que Producteur, mais je vois les formations Marchand dans Academy.

### Cause
Le rôle dans `localStorage` ne correspond pas au profil actuel.

### Solution ✅
1. **Ouvrez la console** (F12)
2. Tapez : `localStorage.getItem('julaba_user_data')`
3. Vérifiez le champ `"role"`
4. Si ce n'est pas le bon :
   - Utilisez ProfileSwitcher pour changer
   - OU supprimez le localStorage : `localStorage.clear()` puis reconnectez-vous

---

## ❌ Problème : "Formation du jour ne change pas"

### Symptôme
La "Formation du jour" reste toujours la même, même après l'avoir complétée.

### Cause
L'algorithme détecte la première formation non complétée. Si toutes sont complétées, ça reste sur la dernière.

### Solution ✅
**Normal !** La "Formation du jour" est :
- La **première non complétée**
- Si toutes complétées → La dernière formation

Pour réinitialiser :
```typescript
// Dans la console
localStorage.removeItem('academy_progress');
```
Puis rafraîchissez la page.

---

## ❌ Problème : "XP ne s'incrémente pas"

### Symptôme
Je complète des étapes mais mon XP reste à 0.

### Cause
Le système de progression n'est pas encore sauvegardé dans le contexte global.

### Solution ✅
**Actuellement en dev** - Le XP est calculé mais pas encore persisté entre les sessions.

**Workaround temporaire** :
- Le XP s'affiche correctement dans la session active
- Au refresh, il repart de 0 (normal en dev)
- Intégration avec ScoreContext prévue en V2.3

---

## ❌ Problème : "Erreur 404 sur /academy"

### Symptôme
`Cannot GET /producteur/academy`

### Cause
Les routes ne sont pas correctement chargées dans `routes.tsx`.

### Solution ✅
1. Vérifiez que `UniversalAcademy` est bien importé :
```typescript
import { UniversalAcademy } from './components/academy/UniversalAcademy';
```

2. Vérifiez la route dans `routes.tsx` :
```typescript
{
  path: '/producteur',
  element: <AppLayout />,
  children: [
    // ...
    {
      path: 'academy',
      element: <UniversalAcademy />,
    },
  ],
}
```

3. Redémarrez le serveur de dev

---

## ❌ Problème : "Erreur Import 'Zap' not found"

### Symptôme
```
Module '"lucide-react"' has no exported member 'Zap'
```

### Cause
L'icône `Zap` n'est pas importée dans le fichier profil.

### Solution ✅
Ajoutez `Zap` aux imports lucide-react :
```typescript
import {
  // ... autres icônes
  Zap,
} from 'lucide-react';
```

---

## ❌ Problème : "Modal Academy ne s'affiche pas"

### Symptôme
Je clique sur une formation, rien ne se passe.

### Cause
État de modal non défini ou collision avec d'autres modals.

### Solution ✅
1. Vérifiez que `isModalOpen` est bien géré dans AppContext
2. Fermez tous les autres modals avant d'ouvrir Academy
3. Vérifiez la console pour les erreurs JavaScript

---

## ❌ Problème : "Bouton Academy mal positionné"

### Symptôme
Le bouton Academy est au mauvais endroit dans la page Profil.

### Cause
Ordre des composants non respecté.

### Solution ✅
Le bouton doit être positionné :
- **Producteur** : Après "Mes Statistiques"
- **Autres profils** : Après "Documents & Certifications"
- **Avant** : "Actions rapides" ou "Informations personnelles"

Vérifiez l'ordre dans le fichier `[Profil].tsx`.

---

## ❌ Problème : "localStorage plein"

### Symptôme
`QuotaExceededError: localStorage quota exceeded`

### Cause
Trop de données stockées dans localStorage.

### Solution ✅
1. Ouvrez DevTools → Application → Local Storage
2. Supprimez les anciennes clés non utilisées
3. Ou videz complètement : `localStorage.clear()`

**Attention** : Vous perdrez les données de progression !

---

## ❌ Problème : "Profils ne se synchronisent pas"

### Symptôme
Je change de profil via ProfileSwitcher, mais le UserContext reste sur l'ancien.

### Cause
Conflit entre AppContext et UserContext.

### Solution ✅
1. Videz le localStorage : `localStorage.clear()`
2. Rafraîchissez la page (F5)
3. Reconnectez-vous via ProfileSwitcher
4. Vérifiez que les deux contexts sont synchronisés :
```javascript
// Console
console.log('AppContext:', window.__APP_USER__);
console.log('UserContext:', localStorage.getItem('julaba_user_data'));
```

---

## ❌ Problème : "Animations ne fonctionnent pas"

### Symptôme
Pas d'animations sur les boutons/modals.

### Cause
Motion/React non installé ou mal importé.

### Solution ✅
1. Vérifiez l'installation :
```bash
npm list motion
# ou
pnpm list motion
```

2. Si absent, installez :
```bash
npm install motion
# ou
pnpm add motion
```

3. Vérifiez les imports :
```typescript
import { motion, AnimatePresence } from 'motion/react';
```

---

## ❌ Problème : "Vocal Tantie Sagesse ne fonctionne pas"

### Symptôme
Pas de feedback vocal quand je clique sur Academy.

### Cause
`speak()` non défini ou navigateur ne supporte pas Web Speech API.

### Solution ✅
1. Vérifiez que `speak` est bien importé :
```typescript
const { speak } = useApp();
```

2. Vérifiez la compatibilité navigateur :
- ✅ Chrome/Edge : Oui
- ✅ Safari : Oui
- ❌ Firefox : Support limité

3. Activez les permissions audio dans le navigateur

---

## 🛠️ Commandes de debug utiles

### Voir l'utilisateur actuel
```javascript
// Console
JSON.parse(localStorage.getItem('julaba_user_data'))
```

### Réinitialiser tout
```javascript
// Console
localStorage.clear();
location.reload();
```

### Forcer un profil
```javascript
// Console
localStorage.setItem('julaba_user_data', JSON.stringify({
  nom: 'YAO',
  prenoms: 'Konan',
  role: 'producteur',
  telephone: '+225 07 09 08 07 06',
  // ... autres champs
}));
location.reload();
```

### Vérifier les routes
```javascript
// Console
console.table(window.location);
```

---

## 📞 Support

### Si le problème persiste :

1. **Vérifiez la console** (F12) pour les erreurs
2. **Consultez la documentation** (`/ACADEMY_SYSTEM_COMPLETE.md`)
3. **Testez avec un autre profil** via ProfileSwitcher
4. **Redémarrez le serveur** de dev
5. **Videz le cache** du navigateur (Ctrl+Shift+Delete)

---

## ✅ Checklist de débogage

Avant de signaler un bug, vérifiez :

- [ ] Je suis bien en localhost
- [ ] Le bouton Dev Mode est visible
- [ ] J'ai sélectionné le bon profil via ProfileSwitcher
- [ ] J'ai rafraîchi la page après changement de profil
- [ ] La console ne montre pas d'erreurs
- [ ] Le bon rôle est stocké dans localStorage
- [ ] Les routes Academy existent dans routes.tsx
- [ ] Zap est importé dans le fichier profil
- [ ] Motion/React est installé
- [ ] J'utilise un navigateur compatible (Chrome/Edge recommandé)

---

## 🎉 Si tout fonctionne

**Félicitations !** Vous pouvez maintenant tester Academy sur tous les profils ! 🚀

**Bon développement !** 💪

---

**Version** : 2.2.0  
**Date** : 2 Mars 2026  
**Status** : ✅ Guide de dépannage complet
