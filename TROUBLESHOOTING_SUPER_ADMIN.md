# 🔧 Dépannage - Création du Super Admin

## 🚨 Erreur : "Erreur lors de la création du profil Super Admin"

### **Causes Possibles**

1. **Champs manquants dans la table `users_julaba`**
2. **Contraintes de base de données non respectées**
3. **Super Admin existe déjà**
4. **Téléphone déjà utilisé**

---

## 🔍 **Diagnostic Rapide**

### **Étape 1 : Utiliser la Page de Diagnostic**

```
https://julabacom.vercel.app/diagnostic-db
```

Cette page va tester la création et afficher l'erreur détaillée.

---

### **Étape 2 : Vérifier les Logs Supabase**

1. Aller sur https://supabase.com/dashboard
2. Sélectionner le projet JÙLABA
3. Aller dans **Logs** > **Edge Functions**
4. Chercher les logs de `make-server-488793d3`
5. Regarder l'erreur exacte

**Exemple de log :**
```
Super Admin profile creation error: {
  code: '23505',
  message: 'duplicate key value violates unique constraint'
}
```

---

### **Étape 3 : Vérifier la Structure de la Table**

1. Aller sur https://supabase.com/dashboard
2. Sélectionner le projet JÙLABA
3. Aller dans **Table Editor**
4. Ouvrir la table `users_julaba`
5. Vérifier que ces colonnes existent :

**Colonnes Requises :**
- ✅ `auth_user_id` (uuid)
- ✅ `phone` (varchar)
- ✅ `first_name` (varchar)
- ✅ `last_name` (varchar)
- ✅ `role` (varchar)
- ✅ `region` (varchar, nullable)
- ✅ `commune` (varchar, nullable)
- ✅ `activity` (varchar, nullable)
- ✅ `market` (varchar, nullable)
- ✅ `cooperative_name` (varchar, nullable)
- ✅ `institution_name` (varchar, nullable)
- ✅ `score` (integer)
- ✅ `verified_phone` (boolean)

---

## 🛠️ **Solutions par Erreur**

### **Erreur 1 : "column does not exist"**

**Problème :** Une colonne utilisée n'existe pas dans la table.

**Solution :**
1. Vérifier le code backend dans `/supabase/functions/server/index.tsx`
2. Ligne ~357-375 : Route `/auth/create-super-admin`
3. S'assurer que tous les champs existent dans la table

**Colonnes potentiellement manquantes :**
- `validated` → ❌ Retiré du code (n'existe pas)
- `institution_name` → ✅ Devrait exister
- `verified_phone` → ✅ Devrait exister

---

### **Erreur 2 : "duplicate key value"**

**Problème :** Un utilisateur avec ce téléphone existe déjà.

**Solutions :**

**Option A : Utiliser un autre numéro**
```
Essayer avec : 0700000002, 0700000003, etc.
```

**Option B : Supprimer l'utilisateur existant**
1. Aller dans Supabase Dashboard
2. Table Editor > `users_julaba`
3. Chercher l'utilisateur avec ce téléphone
4. Supprimer la ligne
5. Aller dans Authentication > Users
6. Supprimer l'utilisateur correspondant
7. Réessayer

---

### **Erreur 3 : "Un compte Super Admin existe déjà"**

**Problème :** Un Super Admin a déjà été créé via cette route.

**Solutions :**

**Option A : Se connecter avec ce compte**
```
https://julabacom.vercel.app/backoffice/login
```

**Option B : Créer depuis le Back-Office**
1. Se connecter en tant que Super Admin existant
2. Aller dans `/backoffice/utilisateurs`
3. Créer un nouveau compte administrateur
4. Choisir le rôle approprié

**Option C : Supprimer le Super Admin existant** (⚠️ Attention)
1. Supabase Dashboard > Table Editor > `users_julaba`
2. Trouver l'utilisateur avec `role = 'super_admin'`
3. Supprimer
4. Réessayer `/create-super-admin`

---

### **Erreur 4 : "Erreur de connexion au serveur"**

**Problème :** Le backend ne répond pas.

**Solutions :**

**1. Vérifier l'URL de l'API**
```javascript
// Dans CreateSuperAdmin.tsx
const API_URL = `https://${projectId}.supabase.co/functions/v1/make-server-488793d3`;
```

**2. Vérifier les Edge Functions**
- Aller dans Supabase Dashboard
- Edge Functions
- Vérifier que `make-server-488793d3` est déployée

**3. Tester manuellement**
```bash
curl -X POST https://rzefrbv.supabase.co/functions/v1/make-server-488793d3/auth/create-super-admin \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer [SUPABASE_ANON_KEY]" \
  -d '{
    "phone": "0700000001",
    "password": "TestSecure123",
    "firstName": "Test",
    "lastName": "Admin"
  }'
```

---

## 🔧 **Modifications Récentes du Code**

### **Backend : Champ `validated` Retiré**

**Avant :**
```typescript
{
  // ...
  score: 100,
  validated: true,  // ❌ Retiré car n'existe pas
  verified_phone: true
}
```

**Après :**
```typescript
{
  // ...
  score: 100,
  verified_phone: true  // ✅ OK
}
```

**Raison :** Le champ `validated` n'existe probablement pas dans la table `users_julaba`.

---

### **Frontend : Meilleurs Messages d'Erreur**

**Avant :**
```typescript
setError(result.error || 'Erreur lors de la création');
```

**Après :**
```typescript
const errorMsg = result.details 
  ? `${result.error}: ${result.details}` 
  : result.error || 'Erreur lors de la création';
setError(errorMsg);
```

**Bénéfice :** Affiche maintenant les détails techniques de l'erreur.

---

## 🧪 **Tests à Effectuer**

### **Test 1 : Page de Diagnostic**

```
1. Aller sur : https://julabacom.vercel.app/diagnostic-db
2. Cliquer sur "Tester la Création"
3. Observer le résultat :
   - ✅ Succès → Tout fonctionne
   - ❌ Échec → Lire l'erreur détaillée
```

### **Test 2 : Console Navigateur**

```
1. Ouvrir la console (F12)
2. Aller sur /create-super-admin
3. Tenter une création
4. Observer les logs :
   - ❌ Erreur création Super Admin: {...}
   - Copier l'objet d'erreur complet
```

### **Test 3 : Logs Backend**

```
1. Supabase Dashboard > Logs > Edge Functions
2. Chercher : "Super Admin profile creation error"
3. Lire l'erreur PostgreSQL exacte
4. Identifier le champ problématique
```

---

## 📝 **Checklist de Vérification**

### **Base de Données**
- [ ] Table `users_julaba` existe
- [ ] Colonne `auth_user_id` existe
- [ ] Colonne `phone` existe et est UNIQUE
- [ ] Colonne `first_name` existe
- [ ] Colonne `last_name` existe
- [ ] Colonne `role` existe
- [ ] Colonne `score` existe
- [ ] Colonne `verified_phone` existe
- [ ] Colonne `institution_name` existe
- [ ] Aucune contrainte NOT NULL sur champs optionnels

### **Backend**
- [ ] Edge Function déployée
- [ ] Route `/auth/create-super-admin` accessible
- [ ] Logs activés et visibles
- [ ] CORS configuré correctement

### **Frontend**
- [ ] Page `/create-super-admin` accessible
- [ ] Formulaire affiche correctement
- [ ] Console montre les erreurs détaillées

---

## 🚀 **Solution Rapide (Workaround)**

Si la création via `/create-super-admin` échoue systématiquement :

### **Option : Créer via SQL Direct**

1. Aller dans Supabase Dashboard > SQL Editor
2. Exécuter ce script :

```sql
-- 1. Créer l'utilisateur Auth manuellement
-- (À faire depuis Authentication > Users dans le Dashboard)

-- 2. Insérer le profil dans users_julaba
INSERT INTO users_julaba (
  auth_user_id,
  phone,
  first_name,
  last_name,
  role,
  region,
  commune,
  activity,
  institution_name,
  score,
  verified_phone
) VALUES (
  '[UUID_FROM_AUTH_USERS]',  -- Remplacer par l'ID de l'utilisateur créé
  '0700000001',
  'Super',
  'Admin',
  'super_admin',
  'National',
  'Abidjan',
  'Administration',
  'JÙLABA Back-Office',
  100,
  true
);
```

3. Se connecter via `/backoffice/login` avec :
   - Téléphone : 0700000001
   - Mot de passe : celui défini dans Auth Users

---

## 📞 **Support**

Si le problème persiste :

1. **Copier l'erreur complète** de la console
2. **Copier les logs Supabase**
3. **Faire une capture d'écran**
4. **Envoyer à** : support@julaba.ci

**Informations à inclure :**
- Message d'erreur exact
- Logs backend (si disponibles)
- Structure de la table `users_julaba`
- Version du navigateur
- Date et heure du test

---

**Dernière mise à jour :** Mars 2026  
**Version :** 1.0.1
