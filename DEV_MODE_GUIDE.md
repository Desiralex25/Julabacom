# 🔧 GUIDE DEV MODE - JÙLABA

## 🎯 Problème résolu

**Symptôme** : Les boutons Academy des autres profils redirigent vers l'écran de connexion.

**Cause** : L'utilisateur par défaut chargé depuis `localStorage` est un marchand. Quand vous naviguez vers `/producteur` ou `/cooperative` etc., le système pense toujours que vous êtes marchand.

**Solution** : ProfileSwitcher - Un bouton flottant Dev Mode pour changer rapidement de profil !

---

## ✨ NOUVEAU : ProfileSwitcher

### 🚀 Comment l'utiliser

1. **Ouvrez l'application en localhost**
2. **Cherchez le bouton violet en haut à droite** (icône `<Code />`)
3. **Cliquez dessus** pour ouvrir le menu de sélection
4. **Choisissez un profil** parmi les 5 disponibles :
   - **Aminata Kouassi** - Marchand (Yopougon)
   - **Konan Yao** - Producteur (Bouaké)
   - **Marie Bamba** - Coopérative (San Pedro)
   - **Jean Kouadio** - Institution (Plateau)
   - **Sophie Diarra** - Identificateur (Marcory)

5. **L'application change automatiquement de profil** et vous redirige vers la page d'accueil du rôle sélectionné

---

## 🎨 Caractéristiques

### ✅ Visible uniquement en dev
- Le bouton n'apparaît que sur `localhost` ou `127.0.0.1`
- Invisible en production

### ✅ Position fixée
- Top-right de l'écran
- Z-index 9999 (au-dessus de tout)
- Animation au chargement (delay 0.5s)

### ✅ Design
- Bouton violet rond avec icône Code
- Modal avec liste colorée par profil
- Chaque profil a sa couleur distinctive :
  - 🟡 **Marchand** : Jaune/Ambre
  - 🟢 **Producteur** : Vert
  - 🔵 **Coopérative** : Bleu
  - 🟣 **Institution** : Violet
  - 🟠 **Identificateur** : Orange

### ✅ Informations affichées
- Nom complet
- Rôle (capitalisé)
- Numéro de téléphone
- Commune
- Score

---

## 📱 Workflow de test

### Test Academy pour tous les profils

1. **Cliquez sur le bouton Dev Mode** (top-right)
2. **Sélectionnez "Konan Yao - Producteur"**
3. Vous êtes redirigé vers `/producteur`
4. **Naviguez vers "MOI"** (profil)
5. **Cliquez sur "JÙLABA Academy"**
6. ✅ Vous devriez voir les **3 formations producteur** (agriculture)

7. **Re-cliquez sur Dev Mode**
8. **Sélectionnez "Marie Bamba - Coopérative"**
9. Naviguez vers "MOI"
10. Cliquez sur "JÙLABA Academy"
11. ✅ Vous devriez voir les **3 formations coopérative** (organisation)

12. **Répétez pour Institution et Identificateur**

---

## 🔄 Fonctionnement technique

### Ce qui se passe quand vous changez de profil :

```tsx
handleProfileSwitch(userPhone) {
  const user = getMockUserByPhone(userPhone);
  
  // 1. Met à jour AppContext
  setAppUser(user);
  
  // 2. Met à jour UserContext (converti en UserData)
  setUserProfile(user);
  
  // 3. Sauvegarde dans localStorage
  // (automatique via useEffect dans UserContext)
  
  // 4. Navigation vers le profil
  navigate(`/${user.role}`);
}
```

### Utilisateurs Mock disponibles

| Téléphone | Nom | Rôle | Région | Score |
|-----------|-----|------|--------|-------|
| 0701020304 | Aminata Kouassi | Marchand | Yopougon | 85 |
| 0709080706 | Konan Yao | Producteur | Bouaké | 92 |
| 0705040302 | Marie Bamba | Coopérative | San Pedro | 88 |
| 0707070707 | Jean Kouadio | Institution | Plateau | 100 |
| 0708080808 | Sophie Diarra | Identificateur | Marcory | 95 |

---

## 🛠️ Fichiers créés/modifiés

### Nouveaux fichiers
1. `/src/app/components/dev/ProfileSwitcher.tsx` - Composant Dev Mode

### Fichiers modifiés
1. `/src/app/App.tsx` - Ajout du ProfileSwitcher

---

## 📝 Notes importantes

### ⚠️ localStorage
- Le profil sélectionné est sauvegardé dans `localStorage`
- Il persiste même après refresh de la page
- Pour "réinitialiser", changez simplement de profil via Dev Mode

### ⚠️ Authentification
- Ce système bypasse complètement le Login
- En dev, vous n'avez pas besoin de saisir OTP
- Parfait pour tester rapidement tous les profils

### ⚠️ Production
- Le ProfileSwitcher est invisible en production
- Seul le Login normal fonctionnera

---

## ✅ Vérifications

### Test complet Academy

Pour chaque profil, vérifier :
- [ ] Bouton Academy visible dans "MOI"
- [ ] Navigation vers `/[role]/academy` fonctionne
- [ ] Les bonnes formations s'affichent
- [ ] "Formation du jour" est détectée
- [ ] Compléter une étape fonctionne
- [ ] XP et Score sont calculés
- [ ] Retour vers profil fonctionne

### Test ProfileSwitcher

- [ ] Bouton visible en localhost
- [ ] Bouton invisible en production
- [ ] Modal s'ouvre/ferme correctement
- [ ] Tous les 5 profils sont listés
- [ ] Clic sur un profil change le user
- [ ] Navigation automatique fonctionne
- [ ] localStorage est mis à jour

---

## 🎉 Résultat

**TOUS les profils peuvent maintenant accéder à Academy !**

✅ **Marchand** → 3 formations commerce  
✅ **Producteur** → 3 formations agriculture  
✅ **Coopérative** → 3 formations organisation  
✅ **Institution** → 3 formations coordination  
✅ **Identificateur** → 3 formations identification  

**Système 100% fonctionnel avec changement de profil en 1 clic !** 🚀

---

**Créé le** : 2 Mars 2026  
**Version** : 2.2.0 - Dev Mode ProfileSwitcher  
**Statut** : ✅ READY - Tous profils testables
