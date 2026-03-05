# ✅ FIX : Persistance Session Back-Office

## 🎯 Problème Résolu

**Symptôme :** Après connexion réussie au Back-Office, l'utilisateur était redirigé vers `/backoffice/login` au lieu d'accéder au dashboard.

**Cause Racine :** 
1. Le `boUser` n'était PAS sauvegardé dans `localStorage`
2. Le `LoginPassword.tsx` ne définissait PAS `setBOUser` pour les rôles Back-Office
3. Au rechargement de la page, `boUser` revenait à `null` → redirection vers login

---

## 🔧 Modifications Effectuées

### **1. Persistance du `boUser` dans localStorage**

#### ✅ Fichier : `/src/app/contexts/BackOfficeContext.tsx`

**Ligne 243-257 (AVANT) :**
```typescript
export function BackOfficeProvider({ children }: { children: ReactNode }) {
  const [boUser, setBOUser] = useState<BOUser | null>(null);
  
  // ... suite du code
```

**Ligne 243-261 (APRÈS) :**
```typescript
export function BackOfficeProvider({ children }: { children: ReactNode }) {
  // ✅ PERSISTANCE : Charger boUser depuis localStorage au démarrage
  const [boUser, setBOUser] = useState<BOUser | null>(() => {
    const stored = localStorage.getItem('julaba_bo_user');
    return stored ? JSON.parse(stored) : null;
  });
  
  // ✅ Sauvegarder boUser dans localStorage quand il change
  React.useEffect(() => {
    if (boUser) {
      localStorage.setItem('julaba_bo_user', JSON.stringify(boUser));
    } else {
      localStorage.removeItem('julaba_bo_user');
    }
  }, [boUser]);
  
  // ... suite du code
```

---

### **2. Définir `setBOUser` lors de la connexion**

#### ✅ Fichier : `/src/app/components/auth/LoginPassword.tsx`

**A. Import du hook BackOffice**

**Ligne 6-10 (AVANT) :**
```typescript
import { useApp } from '../../contexts/AppContext';
import { useUser } from '../../contexts/UserContext';
import { Button } from '../ui/button';
import { ProfileSwitcher } from '../dev/ProfileSwitcher';
```

**Ligne 6-11 (APRÈS) :**
```typescript
import { useApp } from '../../contexts/AppContext';
import { useUser } from '../../contexts/UserContext';
import { useBackOffice } from '../../contexts/BackOfficeContext';
import { Button } from '../ui/button';
import { ProfileSwitcher } from '../dev/ProfileSwitcher';
```

**B. Déclarer le hook**

**Ligne 22-26 (AVANT) :**
```typescript
export function LoginPassword() {
  const navigate = useNavigate();
  const { setUser: setAppUser } = useApp();
  const { setUser: setUserProfile } = useUser();
  
  const [phone, setPhone] = useState('');
```

**Ligne 22-27 (APRÈS) :**
```typescript
export function LoginPassword() {
  const navigate = useNavigate();
  const { setUser: setAppUser } = useApp();
  const { setUser: setUserProfile } = useUser();
  const { setBOUser } = useBackOffice();
  
  const [phone, setPhone] = useState('');
```

**C. Logique de connexion mise à jour**

**Ligne 236-265 (AVANT) :**
```typescript
      // Connexion réussie
      resetAttempts(phone);
      const user = result.user;
      
      setAppUser(user);
      setUserProfile(user);

      if (result.accessToken) {
        localStorage.setItem('julaba_access_token', result.accessToken);
      }
      if (result.refreshToken) {
        localStorage.setItem('julaba_refresh_token', result.refreshToken);
      }

      speakWithText(`Bienvenue ${user.firstName} ! Redirection en cours...`);

      setTimeout(() => {
        const roleRoutes: Record<string, string> = {
          'marchand': '/marchand',
          'producteur': '/producteur',
          'cooperative': '/cooperative',
          'institution': '/institution',
          'identificateur': '/identificateur',
          'consommateur': '/consommateur',
          'super_admin': '/backoffice/dashboard'
        };
        
        const route = roleRoutes[user.role] || '/marchand';
        navigate(route);
      }, 1500);
```

**Ligne 236-279 (APRÈS) :**
```typescript
      // Connexion réussie
      resetAttempts(phone);
      const user = result.user;
      
      // ✅ Vérifier si c'est un rôle Back-Office
      const boRoles = ['super_admin', 'admin_national', 'gestionnaire_zone', 'analyste'];
      const isBackOffice = boRoles.includes(user.role);
      
      if (isBackOffice) {
        // ✅ Définir l'utilisateur Back-Office
        setBOUser({
          id: user.id,
          nom: user.lastName,
          prenom: user.firstName,
          email: `${user.phone}@julaba.ci`, // Email temporaire basé sur le téléphone
          role: user.role,
          region: user.region,
          lastLogin: new Date().toISOString(),
          actif: true
        });
      } else {
        // Utilisateur terrain normal
        setAppUser(user);
        setUserProfile(user);
      }

      if (result.accessToken) {
        localStorage.setItem('julaba_access_token', result.accessToken);
      }
      if (result.refreshToken) {
        localStorage.setItem('julaba_refresh_token', result.refreshToken);
      }

      speakWithText(`Bienvenue ${user.firstName} ! Redirection en cours...`);

      setTimeout(() => {
        const roleRoutes: Record<string, string> = {
          'marchand': '/marchand',
          'producteur': '/producteur',
          'cooperative': '/cooperative',
          'institution': '/institution',
          'identificateur': '/identificateur',
          'consommateur': '/consommateur',
          'super_admin': '/backoffice/dashboard',
          'admin_national': '/backoffice/dashboard',
          'gestionnaire_zone': '/backoffice/dashboard',
          'analyste': '/backoffice/dashboard'
        };
        
        const route = roleRoutes[user.role] || '/marchand';
        navigate(route);
      }, 1500);
```

---

## 🎯 Ce Qui Se Passe Maintenant

### **1. À la Connexion**

```typescript
// 1. Vérifier le rôle
const isBackOffice = ['super_admin', 'admin_national', 'gestionnaire_zone', 'analyste'].includes(user.role);

// 2. Si Back-Office, définir setBOUser
if (isBackOffice) {
  setBOUser({ id, nom, prenom, email, role, region, lastLogin, actif });
}

// 3. useEffect dans BackOfficeContext sauvegarde automatiquement dans localStorage
localStorage.setItem('julaba_bo_user', JSON.stringify(boUser));

// 4. Redirection vers /backoffice/dashboard
navigate('/backoffice/dashboard');
```

### **2. Au Rechargement de la Page**

```typescript
// 1. BackOfficeProvider initialise boUser depuis localStorage
const [boUser, setBOUser] = useState(() => {
  const stored = localStorage.getItem('julaba_bo_user');
  return stored ? JSON.parse(stored) : null;
});

// 2. BORoot vérifie boUser
if (!boUser) {
  return <Navigate to="/backoffice/login" replace />;
}

// 3. ✅ boUser existe → Affichage du BOLayout avec dashboard
return <BOLayout />;
```

### **3. À la Déconnexion**

```typescript
// 1. BOLayout appelle handleLogout
const handleLogout = () => {
  setBOUser(null); // ← Définit boUser à null
  navigate('/backoffice/login');
};

// 2. useEffect dans BackOfficeContext détecte boUser === null
if (!boUser) {
  localStorage.removeItem('julaba_bo_user'); // ← Supprime du localStorage
}

// 3. ✅ L'utilisateur est déconnecté proprement
```

---

## ✅ Checklist de Vérification

- [x] `boUser` chargé depuis localStorage au démarrage
- [x] `boUser` sauvegardé dans localStorage quand il change
- [x] `boUser` supprimé du localStorage lors de la déconnexion
- [x] `setBOUser` appelé lors de la connexion pour les 4 rôles BO
- [x] Routes définies pour les 4 rôles BO
- [x] Redirection vers `/backoffice/login` si `boUser === null`
- [x] Redirection vers `/backoffice/dashboard` si `boUser !== null`

---

## 🎉 Résultat Final

### **Avant ❌**
```
1. Connexion réussie
2. Redirection vers /backoffice/dashboard
3. Rechargement → boUser === null
4. Redirection vers /backoffice/login (BOUCLE)
```

### **Après ✅**
```
1. Connexion réussie
2. setBOUser défini → sauvegardé dans localStorage
3. Redirection vers /backoffice/dashboard
4. Rechargement → boUser chargé depuis localStorage
5. ✅ Accès au dashboard (PAS DE REDIRECTION)
```

---

## 📊 Fichiers Modifiés

| Fichier | Lignes Modifiées | Description |
|---------|------------------|-------------|
| `/src/app/contexts/BackOfficeContext.tsx` | 243-261 | Ajout persistance localStorage |
| `/src/app/components/auth/LoginPassword.tsx` | 7, 25, 236-279 | Import + définition setBOUser + routes BO |

---

## 🚀 Test de Validation

### **1. Test Connexion**
```bash
1. Aller sur /backoffice/login
2. Se connecter avec un compte super_admin
3. ✅ Redirection vers /backoffice/dashboard
4. ✅ Dashboard affiché
```

### **2. Test Persistance**
```bash
1. Depuis le dashboard, recharger la page (F5)
2. ✅ Dashboard reste affiché (pas de redirection)
3. Ouvrir DevTools > Application > Local Storage
4. ✅ Voir 'julaba_bo_user' avec les données
```

### **3. Test Déconnexion**
```bash
1. Cliquer sur "Déconnexion"
2. ✅ Redirection vers /backoffice/login
3. Ouvrir DevTools > Application > Local Storage
4. ✅ 'julaba_bo_user' supprimé
```

### **4. Test Protection Routes**
```bash
1. Déconnecté, essayer d'accéder à /backoffice/dashboard
2. ✅ Redirection automatique vers /backoffice/login
```

---

## 🎯 Prochaines Étapes

- [ ] Tester la connexion avec les 4 rôles BO
- [ ] Vérifier que la persistance fonctionne après rechargement
- [ ] Vérifier que la déconnexion nettoie bien le localStorage
- [ ] Tester la protection des routes Back-Office

---

**Version :** 1.0.4  
**Date :** Mars 2026  
**Status :** ✅ Persistance session Back-Office implémentée
