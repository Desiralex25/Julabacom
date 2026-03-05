# Configuration du Numéro de Support Jùlaba

## Vue d'ensemble

Le numéro de support technique affiché aux nouveaux utilisateurs non enregistrés est configurable par le Back-Office.

## Comment ça fonctionne

### 1. Affichage du numéro

Quand un utilisateur entre un numéro de téléphone qui **n'est pas encore enregistré** dans Jùlaba :

- Il arrive sur l'écran **"Bienvenue sur Jùlaba !"**
- Un message lui indique : *"Pour créer ton compte, contacte un agent identificateur ou un administrateur Jùlaba."*
- Un bouton cliquable affiche le **numéro de support** et permet d'appeler directement

### 2. Configuration par le BO

Le Back-Office peut modifier ce numéro via le KV Store :

#### Option A : Via une future interface BO

Ajouter dans `/src/app/components/backoffice/BOParametres.tsx` :
- Section **"Paramètres d'assistance"**
- Champ **"Numéro de support"**
- Sauvegarde dans `system:support_phone`

#### Option B : Manuellement via API (temporaire)

Pour configurer le numéro immédiatement :

```javascript
// Exemple : Stocker le numéro 0709876543
await kv.set('system:support_phone', '0709876543');
```

### 3. Valeur par défaut

Si aucun numéro n'est configuré, le système utilise : **0700000000**

## Architecture technique

### Backend

**Route GET** : `/make-server-488793d3/system/settings`

```typescript
// Récupère les paramètres système
{
  success: true,
  settings: {
    supportPhone: "0709876543"
  }
}
```

### Frontend

**Fonction API** : `getSystemSettings()`

```typescript
import { getSystemSettings } from '../../utils/api';

const response = await getSystemSettings();
console.log(response.data.supportPhone); // "0709876543"
```

### Composant

**Fichier** : `/src/app/components/auth/Onboarding.tsx`

- Charge le numéro au montage du composant
- Affiche un bouton avec icône Phone (lucide-react)
- Lien `tel:` pour appeler directement

## Prochaines étapes recommandées

### 1. Interface BO pour modifier le numéro

Ajouter dans **BOParametres.tsx** :

```tsx
<div className="bg-white rounded-3xl border-2 p-6">
  <h3 className="font-bold text-lg mb-4">Numéro de support</h3>
  
  <Input
    type="tel"
    value={supportPhone}
    onChange={(e) => setSupportPhone(e.target.value)}
    placeholder="0701020304"
    className="mb-4"
  />
  
  <Button onClick={saveSupportPhone}>
    Enregistrer le numéro
  </Button>
</div>
```

### 2. Backend : Route pour modifier

```typescript
app.post("/make-server-488793d3/system/settings", async (c) => {
  // Vérifier que l'utilisateur est Super Admin
  const { supportPhone } = await c.req.json();
  
  await kv.set('system:support_phone', supportPhone);
  
  return c.json({ success: true });
});
```

### 3. Historique des modifications

Optionnel : Logger les changements dans un audit trail

```typescript
await kv.set(`audit:support_phone:${Date.now()}`, {
  oldValue: currentPhone,
  newValue: supportPhone,
  changedBy: adminId,
  timestamp: new Date().toISOString()
});
```

## Tests

### Tester l'affichage

1. Allez sur la page de connexion Jùlaba
2. Entrez un numéro qui **n'existe pas** (ex: 0799999999)
3. Cliquez sur **"Recevoir le code"**
4. Entrez le code OTP affiché en dev
5. Vous devriez voir l'écran d'onboarding avec le bouton de support

### Tester le changement de numéro

```bash
# Configurez un nouveau numéro
curl -X POST https://YOUR_PROJECT.supabase.co/functions/v1/make-server-488793d3/kv/set \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{"key": "system:support_phone", "value": "0701234567"}'

# Rechargez la page d'onboarding
# Le nouveau numéro devrait s'afficher
```

## Sécurité

- ✅ Lecture publique : Pas de problème, c'est un numéro public
- ✅ Modification : DOIT être réservée aux Super Admins uniquement
- ✅ Validation : Format téléphone ivoirien (10 chiffres commençant par 0)

## Notes importantes

- Le numéro est **mis en cache côté client** pendant la session
- Pour forcer un rafraîchissement : recharger la page
- Le lien `tel:` fonctionne sur mobile et certains ordinateurs avec softphone

---

**Dernière mise à jour** : Mars 2026  
**Fichiers modifiés** :
- `/supabase/functions/server/index.tsx`
- `/src/app/utils/api.ts`
- `/src/app/components/auth/Onboarding.tsx`
