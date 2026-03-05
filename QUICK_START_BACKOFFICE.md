# 🚀 Quick Start : Accès Back-Office JÙLABA

## ⚡ En 2 Étapes Simples

### **Étape 1️⃣ : Créer le Super Admin** (Une seule fois)

```
🌐 URL : https://julabacom.vercel.app/create-super-admin
```

**Formulaire à remplir :**
```
+225 [0700000001]
Prénom : [Ton Prénom]
Nom : [Ton Nom]
Mot de passe : [••••••••] (min 8 caractères)

[Créer le Super Admin]
```

**Résultat :**
```
✅ Super Admin créé avec succès !
📱 Téléphone : 0700000001
👤 Nom : Ton Prénom Ton Nom

[Se connecter maintenant →]
```

---

### **Étape 2️⃣ : Se Connecter**

```
🌐 URL : https://julabacom.vercel.app/backoffice/login
```

**Page de connexion :**
```
┌─────────────────────────────────────┐
│         🔶 JÙLABA Logo              │
│                                     │
│  Connexion                          │
│  Entre ton numéro de téléphone      │
│                                     │
│  +225 [07 00 00 00 01]              │
│                                     │
│  Mot de passe                       │
│  [••••••••]                    👁   │
│                                     │
│  [        Continuer →        ]      │
│                                     │
│  Mot de passe oublié ?              │
└─────────────────────────────────────┘
```

**Après connexion :**
```
✅ Bienvenue [Ton Prénom] ! Redirection en cours...

⏱️ 1.5 secondes...

🎯 Redirection automatique vers :
   /backoffice/dashboard
```

---

## 📊 Dashboard Back-Office

Une fois connecté, tu arrives sur :

```
╔═══════════════════════════════════════════════════════════╗
║  🔶 JÙLABA                          [Profil] [Notifications]║
╠═══════════════════════════════════════════════════════════╣
║                                                             ║
║  📊 TABLEAU DE BORD                                         ║
║                                                             ║
║  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐     ║
║  │ 12,450   │ │ 8,234    │ │ 156      │ │ 23       │     ║
║  │ Acteurs  │ │ Ventes   │ │ Coop.    │ │ Zones    │     ║
║  └──────────┘ └──────────┘ └──────────┘ └──────────┘     ║
║                                                             ║
║  📈 Graphiques & Analytics                                  ║
║                                                             ║
╠═══════════════════════════════════════════════════════════╣
║  📋 Dashboard  👥 Acteurs  🎓 Academy  ⚙️ Paramètres      ║
╚═══════════════════════════════════════════════════════════╝
```

---

## 🎯 Les 14 Modules Disponibles

Une fois connecté, tu as accès à :

1. **📊 Dashboard** - Vue d'ensemble
2. **👥 Acteurs** - Gestion des utilisateurs
3. **🏢 Institutions** - Partenaires institutionnels
4. **📝 Enrôlement** - Nouvelles inscriptions
5. **🔍 Supervision** - Suivi en temps réel
6. **🗺️ Zones** - Gestion territoriale
7. **💰 Commissions** - Système de rémunération
8. **🎓 Academy** - Formation & contenu
9. **🎯 Missions** - Gamification
10. **📊 Rapports** - Analytics avancés
11. **🔔 Notifications** - Centre de messages
12. **🛡️ Audit** - Logs & traçabilité
13. **👤 Profil** - Ton compte
14. **⚙️ Paramètres** - Configuration système

---

## 🔐 Comptes Supplémentaires

Pour créer d'autres comptes administrateurs :

```
/backoffice/utilisateurs
→ Bouton "Créer un utilisateur"
→ Choisir le rôle (Super Admin, Admin National, etc.)
```

---

## ⚠️ Important

### **Route de Bootstrap**
- `/create-super-admin` est **désactivée automatiquement** après la première création
- Si un Super Admin existe déjà, tu recevras l'erreur :
  ```
  ❌ Un compte Super Admin existe déjà
  ```

### **Sécurité**
- ✅ 5 tentatives maximum
- ✅ Blocage 15 minutes après échec
- ✅ Mots de passe cryptés
- ✅ Sessions sécurisées JWT

---

## 🆘 Problèmes Courants

### **1. "Compte bloqué"**
**Solution :** Attendre 15 minutes ou utiliser "Mot de passe oublié"

### **2. "Identifiants incorrects"**
**Solution :** Vérifier le numéro de téléphone (10 chiffres sans espaces)

### **3. "Token invalide ou expiré"**
**Solution :** Se reconnecter

### **4. "Super Admin existe déjà"**
**Solution :** Utiliser `/backoffice/login` pour te connecter

---

## 📞 Contacts

**Support Technique :** support@julaba.ci  
**Documentation :** https://docs.julaba.ci  
**Status :** https://status.julaba.ci

---

**Bonne utilisation du Back-Office JÙLABA ! 🚀**
