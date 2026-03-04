# 🔄 PARCOURS UTILISATEURS SÉQUENTIELS DÉTAILLÉS - JULABA

**Date** : Mars 2026  
**Version** : 1.0.0  
**Type** : Documentation technique complète des workflows

---

## 📋 TABLE DES MATIÈRES

1. [Parcours commun d'entrée (Tous profils)](#parcours-commun)
2. [Profil MARCHAND 🟠](#profil-marchand)
3. [Profil PRODUCTEUR 🟢](#profil-producteur)
4. [Profil COOPÉRATIVE 🔵](#profil-cooperative)
5. [Profil IDENTIFICATEUR 🟤](#profil-identificateur)
6. [Profil INSTITUTION/ADMIN 🟣](#profil-institution)

---

# 📱 PARCOURS COMMUN D'ENTRÉE (Tous profils) {#parcours-commun}

## WORKFLOW A : Premier lancement de l'application

### **ÉTAPE 1 : SPLASH SCREEN**
**Route** : `/onboarding` (screen -1)  
**Durée** : 2 secondes  
**État** : Non interactif

**Affichage** :
- Logo JULABA animé (fade in + scale)
- Fond dégradé orange

**Transition automatique** :
```
APRÈS 2 secondes → ÉTAPE 2
```

---

### **ÉTAPE 2 : ONBOARDING - ÉCRAN 0**
**Route** : `/onboarding` (screen 0)  
**Composant** : `Onboarding.tsx`

**Affichage** :
- Image : Marché africain (background plein écran)
- Titre : "BIENVENUE SUR"
- Logo JULABA
- Description : "Jùlaba t'aide à bien gérer ton argent"
- 3 boutons :
  - 🔊 **Écouter** (icône haut-parleur)
  - ➡️ **Suivant** (bouton principal orange)
  - ⏩ **Passer** (texte lien blanc en bas)

**Actions utilisateur possibles** :

**ACTION A.1** : Clic sur 🔊 **Écouter**
```
→ Synthèse vocale lit le titre + description
→ Reste sur ÉTAPE 2
```

**ACTION A.2** : Clic sur ➡️ **Suivant**
```
→ ÉTAPE 3
```

**ACTION A.3** : Clic sur ⏩ **Passer**
```
→ ÉTAPE 11 (Login direct)
```

---

### **ÉTAPE 3 : ONBOARDING - ÉCRAN 1**
**Route** : `/onboarding` (screen 1)

**Affichage** :
- Image : Commerce offline
- Titre : "ACHETEZ ET VENDEZ"
- Description : "Tu vends. Tu vois ce que tu gagnes."
- Mêmes boutons (Écouter, Suivant, Passer)

**Actions** :
- **Écouter** → Synthèse vocale
- **Suivant** → ÉTAPE 4
- **Passer** → ÉTAPE 11

---

### **ÉTAPE 4 : ONBOARDING - ÉCRAN 2**
**Route** : `/onboarding` (screen 2)

**Affichage** :
- Image : Tantie Sagesse (avatar assistante)
- Titre : "VOTRE ASSISTANTE VOCALE"
- Description : "Tantie Sagesse vous accompagne à chaque étape. Parlez naturellement, elle vous écoute et vous guide..."

**Actions** :
- **Écouter** → Synthèse vocale
- **Suivant** → ÉTAPE 5
- **Passer** → ÉTAPE 11

---

### **ÉTAPE 5 : ONBOARDING - ÉCRAN 3**
**Route** : `/onboarding` (screen 3)

**Affichage** :
- Image : Cotisations sociales
- Titre : "COTISATIONS SOCIALES"
- Description : "Gérez vos cotisations CNPS et CMU..."
- Bouton : **Commencer** (au lieu de Suivant)

**Actions** :
- **Écouter** → Synthèse vocale
- **Commencer** → ÉTAPE 11
- **Passer** → ÉTAPE 11

---

### **ÉTAPE 11 : LOGIN - SAISIE TÉLÉPHONE**
**Route** : `/login`  
**Composant** : `Login.tsx`

**Affichage** :
- Logo JULABA en haut
- Titre : "Bienvenue sur JULABA"
- Sous-titre : "Plateforme nationale d'inclusion économique des acteurs vivriers"
- Input : Numéro de téléphone (format : 0707070707)
- Bouton : **Continuer** (orange, disabled si vide)
- Lien bas de page : "Revoir le tutoriel" (retour onboarding)
- FAB Tantie Sagesse (coin inférieur droit)
- Logos partenaires : Orange Money, Ton Djè, JULABA

**État initial** :
```typescript
showOTP: false
phone: ''
```

**Synthèse vocale automatique à l'ouverture** :
```
"Bienvenue sur JULABA. Entre ton numéro de téléphone"
```

**Actions utilisateur** :

**ACTION B.1** : Saisie numéro de téléphone
```
→ Validation format ivoirien (10 chiffres commençant par 0)
→ Si valide : Bouton "Continuer" activé
→ Si invalide : Bouton reste désactivé
```

**ACTION B.2** : Clic FAB Tantie Sagesse
```
→ Synthèse vocale : "Votre numéro saisi est [numéro]"
→ Reste sur ÉTAPE 11
```

**ACTION B.3** : Triple-clic sur logo JULABA (MODE DEV)
```
→ MODAL : Liste de tous les utilisateurs mock
→ Affichage : Nom, Rôle, Téléphone
→ Clic sur utilisateur :
   → Remplissage automatique phone
   → Auto-login
   → REDIRECTION selon rôle (ÉTAPE 100+)
```

**ACTION B.4** : Clic "Revoir le tutoriel"
```
→ Suppression flag localStorage 'julaba_skip_onboarding'
→ RETOUR ÉTAPE 2 (Onboarding écran 0)
```

**ACTION B.5** : Clic bouton **Continuer**
```
IF numéro existe dans base de données :
   → Synthèse vocale : "Code de vérification envoyé"
   → showOTP = true
   → ÉTAPE 12
   
ELSE :
   → Synthèse vocale : "Ce numéro n'est pas encore enregistré"
   → Affichage message d'erreur rouge
   → Apparition bouton "Créer mon compte"
   → RESTE sur ÉTAPE 11
   
   → Si clic "Créer mon compte" :
      → REDIRECTION /inscription (ÉTAPE 20 - Non finalisée)
```

**CONDITION DE BLOCAGE** :
- ⛔ Bouton "Continuer" désactivé tant que phone.length !== 10

---

### **ÉTAPE 12 : LOGIN - SAISIE CODE OTP**
**Route** : `/login`  
**État** : `showOTP = true`

**Affichage** :
- Titre : "Entre ton code de vérification"
- Sous-titre : "Envoyé au [numéro masqué]"
- 4 inputs OTP (auto-focus cascade)
- Bouton : **Valider** (apparaît automatiquement quand 4 chiffres saisis)
- Lien : "Modifier le numéro" (retour ÉTAPE 11)

**Code OTP par défaut (DEMO)** : `1234`

**État** :
```typescript
otp: ['', '', '', '']
error: ''
```

**Actions** :

**ACTION C.1** : Saisie des 4 chiffres OTP
```
→ Auto-focus sur input suivant après chaque saisie
→ Quand 4 chiffres saisis :
   → Auto-validation (appel handleOTPSubmit)
   → Pas besoin de cliquer "Valider"
```

**ACTION C.2** : Validation automatique
```
IF otp.join('') === '1234' (ou tout code valide en démo) :
   → Recherche utilisateur par téléphone : getMockUserByPhone(phone)
   
   IF utilisateur trouvé :
      → setAppUser(user)
      → setUserProfile(user)
      → Synthèse vocale : "Bienvenue [Prénom]. Ton djè est calé"
      → Délai 500ms
      → REDIRECTION selon user.role :
         ├─ 'marchand' → /marchand (ÉTAPE 100)
         ├─ 'producteur' → /producteur (ÉTAPE 200)
         ├─ 'cooperative' → /cooperative (ÉTAPE 300)
         ├─ 'identificateur' → /identificateur (ÉTAPE 400)
         └─ 'institution' → /institution (ÉTAPE 500)
   
   ELSE :
      → Erreur : "Utilisateur non trouvé"
      → RETOUR ÉTAPE 11

ELSE (code incorrect) :
   → Synthèse vocale : "Code incorrect"
   → Shake animation sur inputs
   → Reset otp = ['', '', '', '']
   → Focus sur premier input
   → RESTE sur ÉTAPE 12
```

**ACTION C.3** : Clic "Modifier le numéro"
```
→ showOTP = false
→ RETOUR ÉTAPE 11
```

**ACTION C.4** : Clic FAB Tantie Sagesse
```
→ Synthèse vocale : "Le code entré est [code]"
→ RESTE sur ÉTAPE 12
```

**CONDITION DE BLOCAGE** :
- ⛔ Validation impossible tant que otp.length !== 4

---

### **ÉTAPE 20 : INSCRIPTION (NON FINALISÉE)**
**Route** : `/inscription`  
**Composant** : `Inscription.tsx`

**État** : Interface présente mais workflow incomplet

**Affichage** :
- Formulaire d'inscription basique
- (Détails à finaliser)

---

---

# 1️⃣ PROFIL MARCHAND 🟠 {#profil-marchand}

**Couleur primaire** : `#C66A2C` (Orange)  
**Base route** : `/marchand`

---

## WORKFLOW M1 : Connexion et arrivée sur Dashboard

### **ÉTAPE 100 : DASHBOARD MARCHAND - JOURNÉE FERMÉE**
**Route** : `/marchand` (index)  
**Composant** : `MarchandHome.tsx` + `RoleDashboard.tsx`

**État initial de session** :
```typescript
currentSession: {
  opened: false,
  fondInitial: 0,
  dateOuverture: null
}
```

**Affichage** :

**Header** :
- Photo profil + Nom marchand
- Message : "Bonjour [Prénom] ! Ouvre ta journée pour commencer"
- Icône 🔊 (Écouter le message)

**Badge de session** :
- 🔴 "Journée fermée" (badge rouge)

**KPIs (grisés/désactivés)** :
- 📊 Ventes du jour : 0 FCFA
- 📈 Marge du jour : 0 FCFA
- 💰 Caisse : 0 FCFA

**Actions principales (DÉSACTIVÉES)** :
- ✅ "Je vends" (bouton vert mais grisé + overlay)
- ❌ "Je dépense" (bouton rouge mais grisé + overlay)
- Texte : "Ouvre ta journée pour activer"

**Section Score JULABA** :
- Badge circulaire avec score (ex: 85/100)
- Niveau : Or
- Clic → Modal ScoreModal

**Bouton PRINCIPAL visible** :
- 🟠 **"Ouvrir ma journée"** (bouton orange, pulsant)
- Position : Au-dessus des actions désactivées

**Coach Mark** (après 5 secondes) :
- Indicateur pulsant autour de "Ouvrir ma journée"
- Synthèse vocale automatique : "Ouvre ta journée pour activer ta caisse"
- Dismissible (croix ou clic ailleurs)

**Bottom Navigation Bar** :
- 🏠 Accueil (actif, orange)
- 🏪 Marché
- 📦 Produits
- 👤 Moi

**Actions utilisateur** :

**ACTION M1.1** : Clic 🔊 Écouter le message
```
→ Synthèse vocale : "Bonjour [Prénom] ! Ouvre ta journée pour commencer"
→ RESTE sur ÉTAPE 100
```

**ACTION M1.2** : Clic badge Score
```
→ Ouverture MODAL : ScoreModal
→ Affichage détails scoring JULABA
→ Fermeture modal → RETOUR ÉTAPE 100
```

**ACTION M1.3** : Clic "Je vends" (désactivé)
```
→ Synthèse vocale : "Ouvre ta journée d'abord"
→ Animation shake du bouton "Ouvrir ma journée"
→ RESTE sur ÉTAPE 100
```

**ACTION M1.4** : Clic "Je dépense" (désactivé)
```
→ Synthèse vocale : "Ouvre ta journée d'abord"
→ Animation shake du bouton "Ouvrir ma journée"
→ RESTE sur ÉTAPE 100
```

**ACTION M1.5** : Clic **"Ouvrir ma journée"**
```
→ Ouverture MODAL OpenDayModal
→ ÉTAPE 101
```

**ACTION M1.6** : Clic Bottom Bar "Marché"
```
→ NAVIGATION /marchand/marche
→ ÉTAPE 110 (Marché Virtuel)
```

**ACTION M1.7** : Clic Bottom Bar "Produits"
```
→ NAVIGATION /marchand/stock
→ ÉTAPE 120 (Gestion Stock)
```

**ACTION M1.8** : Clic Bottom Bar "Moi"
```
→ NAVIGATION /marchand/profil
→ ÉTAPE 130 (Profil)
```

**ACTION M1.9** : Clic FAB Tantie Sagesse
```
→ Ouverture MODAL TantieSagesse
→ Choix : Parler 🎤 ou Écrire ✍️
→ Fermeture → RETOUR ÉTAPE 100
```

---

### **ÉTAPE 101 : MODAL - OUVRIR MA JOURNÉE**
**État** : Modal overlay sur ÉTAPE 100  
**Composant** : `OpenDayModal` dans `MarchandModals.tsx`

**Affichage** :
- Header : Icône 📅 + "Ouvre ta journée"
- Sous-titre : "Combien as-tu dans ta caisse ?"
- Input numérique : Fond de caisse (FCFA)
- Sélecteur visuel de billets et pièces :
  - Billets : 10 000 | 5 000 | 2 000 | 1 000 | 500
  - Pièces : 250 | 200 | 100 | 50 | 25
- Affichage total dynamique : "Total : XX XXX FCFA"
- Bouton : **"C'est bon !"** (vert, activé si montant > 0)
- Bouton : **Annuler** (gris)

**État local** :
```typescript
fondInitial: ''
error: ''
```

**Règles de validation** :
- ✅ Montant doit être ≥ 0
- ✅ Montant doit être un multiple de 25 FCFA (validation temps réel)
- ❌ Si non-multiple de 100 : Warning "Le montant doit être un multiple de 100 FCFA"

**Actions** :

**ACTION M2.1** : Saisie manuelle dans input
```
→ Mise à jour fondInitial
→ Validation en temps réel :
   IF montant % 100 !== 0 :
      → Affichage warning orange
      → Synthèse vocale : (rien)
   ELSE :
      → Masquage warning
→ RESTE sur ÉTAPE 101
```

**ACTION M2.2** : Clic sur billet (ex: 10 000 FCFA)
```
→ fondInitial += 10000
→ Synthèse vocale : "10 000 francs ajouté. Total : [nouveau total] francs"
→ RESTE sur ÉTAPE 101
```

**ACTION M2.3** : Clic sur pièce (ex: 500 FCFA)
```
→ fondInitial += 500
→ Synthèse vocale : "500 francs ajouté. Total : [nouveau total] francs"
→ RESTE sur ÉTAPE 101
```

**ACTION M2.4** : Clic **"C'est bon !"**
```
IF fondInitial invalide (NaN ou < 0) :
   → Synthèse vocale : "Le montant saisi est invalide"
   → Affichage erreur rouge
   → RESTE sur ÉTAPE 101

ELSE IF fondInitial % 100 !== 0 :
   → Synthèse vocale : "Le montant doit être un multiple de 100 francs"
   → Affichage erreur orange
   → RESTE sur ÉTAPE 101

ELSE :
   → Appel AppContext.openDay(montant)
   → Update state :
      currentSession = {
        opened: true,
        fondInitial: montant,
        dateOuverture: new Date().toISOString()
      }
   → Synthèse vocale : "Ta journée est ouverte avec [montant] francs CFA"
   → Fermeture modal
   → TRANSITION ÉTAPE 102
```

**ACTION M2.5** : Clic **Annuler** ou ❌
```
→ Reset fondInitial = ''
→ Reset error = ''
→ Fermeture modal
→ RETOUR ÉTAPE 100 (journée reste fermée)
```

**CONDITION DE BLOCAGE** :
- ⛔ Bouton "C'est bon !" disabled si fondInitial === ''

---

### **ÉTAPE 102 : DASHBOARD MARCHAND - JOURNÉE OUVERTE**
**Route** : `/marchand`  
**État** : `currentSession.opened = true`

**Affichage** :

**Header** :
- Message dynamique selon stats :
  ```
  IF ventes > 0 && depenses === 0 :
    "Bravo ! Tu as [ventes] FCFA de ventes. Ta caisse est à [caisse] FCFA"
  
  ELSE IF ventes > 0 && depenses > 0 :
    "Ta caisse actuelle est de [caisse] FCFA. Continue comme ça !"
  
  ELSE IF ventes === 0 && depenses > 0 :
    "Attention, tu as [depenses] FCFA de dépenses. Ta caisse est à [caisse] FCFA"
  
  ELSE :
    "Ta caisse est prête avec [caisse] FCFA. Commence à vendre !"
  ```

**Badge de session** :
- 🟢 "Journée ouverte" (badge vert)
- Date : "Aujourd'hui, [Date]"
- Sous-icône ⚙️ : Modifier fond de caisse

**KPIs (ACTIFS, cliquables)** :
- 📊 Ventes du jour : [montant] FCFA (carte verte)
- 📈 Marge du jour : [montant] FCFA (carte verte)
- 💰 Caisse actuelle : [fondInitial + ventes - depenses] FCFA

**Actions principales (ACTIVÉES)** :
- ✅ **"Je vends"** (bouton vert, actif)
- ❌ **"Je dépense"** (bouton rouge, actif)

**Nouveau bouton** :
- 🔒 **"Fermer ma journée"** (bouton orange, en bas)

**Actions** :

**ACTION M3.1** : Clic carte "Ventes du jour"
```
→ Ouverture MODAL StatsVentesModal
→ Affichage détails ventes
→ Fermeture → RETOUR ÉTAPE 102
```

**ACTION M3.2** : Clic carte "Marge du jour"
```
→ Ouverture MODAL StatsMargeModal
→ Affichage calcul marge
→ Fermeture → RETOUR ÉTAPE 102
```

**ACTION M3.3** : Clic ⚙️ "Modifier fond de caisse"
```
→ Ouverture MODAL EditFondModal
→ ÉTAPE 103
```

**ACTION M3.4** : Clic **"Je vends"**
```
→ NAVIGATION /marchand/vendre
→ ÉTAPE 104 (Formulaire vente)
```

**ACTION M3.5** : Clic **"Je dépense"**
```
→ NAVIGATION /marchand/depenses
→ ÉTAPE 105 (Formulaire dépense)
```

**ACTION M3.6** : Clic **"Fermer ma journée"**
```
→ Ouverture MODAL CloseDayModal
→ ÉTAPE 106
```

**ACTION M3.7** : Clic FAB Tantie Sagesse
```
→ Ouverture MODAL VenteVocaleModal
→ Mode vente par commande vocale
→ Fermeture → RETOUR ÉTAPE 102
```

---

### **ÉTAPE 103 : MODAL - MODIFIER FOND DE CAISSE**
**Composant** : `EditFondModal`

**Affichage** :
- Titre : "Modifier le fond de caisse"
- Affichage actuel : "Fond actuel : [montant] FCFA"
- Input : Nouveau montant
- Sélecteur billets/pièces (comme OpenDayModal)
- Bouton : **"Valider"**
- Bouton : **"Annuler"**

**Actions** :

**ACTION M3b.1** : Modification du montant
```
→ Validation identique à OpenDayModal
→ RESTE sur ÉTAPE 103
```

**ACTION M3b.2** : Clic **"Valider"**
```
→ Update currentSession.fondInitial = nouveau montant
→ Recalcul caisse actuelle
→ Synthèse vocale : "Fond de caisse modifié à [montant] francs"
→ Fermeture modal
→ RETOUR ÉTAPE 102
```

**ACTION M3b.3** : Clic **"Annuler"**
```
→ Fermeture sans modification
→ RETOUR ÉTAPE 102
```

---

### **ÉTAPE 104 : FORMULAIRE VENDRE**
**Route** : `/marchand/vendre`  
**Composant** : `VendreForm.tsx`

**CONDITION D'ACCÈS** :
```
IF currentSession.opened === false :
   → BLOCAGE
   → Redirection automatique /marchand
   → Message : "Ouvre ta journée d'abord"
```

**Affichage** :
- Header : ← Retour + "Enregistrer une vente"
- Sous-titre : "Parle ou remplis le formulaire"
- Formulaire :
  - 📦 **Produit** (Input texte ou dropdown)
  - 🔢 **Quantité** (Input numérique)
  - 💰 **Prix unitaire** (Input FCFA)
  - Calcul auto : **Total = Quantité × Prix**
  - 💳 **Mode de paiement** (Radio buttons) :
    - 🟠 Orange Money
    - 🟡 MTN Mobile Money
    - 🔵 Moov Money
    - 🟢 Wave
    - 💵 Cash (sélectionné par défaut)
- Bouton : **"Enregistrer la vente"** (vert)

**État** :
```typescript
formData: {
  productName: '',
  quantity: '',
  price: '',
  paymentMethod: 'cash'
}
```

**Actions** :

**ACTION M4.1** : Clic ← Retour
```
→ NAVIGATION /marchand
→ RETOUR ÉTAPE 102
```

**ACTION M4.2** : Saisie des champs
```
→ Mise à jour formData
→ Validation temps réel
→ RESTE sur ÉTAPE 104
```

**ACTION M4.3** : Clic **"Enregistrer la vente"**
```
IF champs incomplets (productName OU quantity OU price vide) :
   → Synthèse vocale : "Remplis tous les champs s'il te plaît"
   → Affichage erreurs sur champs vides
   → RESTE sur ÉTAPE 104

ELSE :
   → Calcul total = quantity × price
   → Appel AppContext.addTransaction({
       userId: user.id,
       type: 'vente',
       productName,
       quantity,
       price,
       paymentMethod,
       timestamp: now
     })
   → Update stats :
      stats.ventes += total
      stats.caisse += total
   → Synthèse vocale : "Vente de [quantity] [productName] à [total] francs CFA enregistrée"
   → Délai 500ms
   → NAVIGATION /marchand
   → RETOUR ÉTAPE 102 (avec stats mises à jour)
```

**ACTION M4.4** : Commande vocale (non finalisée)
```
→ Clic micro
→ Reconnaissance vocale
→ Parsing commande (ex: "j'ai vendu 5 sacs de riz à 25000")
→ Remplissage auto du formulaire
→ RESTE sur ÉTAPE 104
```

---

### **ÉTAPE 105 : FORMULAIRE DÉPENSE**
**Route** : `/marchand/depenses`  
**Composant** : `MarchandDepenses.tsx`

**CONDITION D'ACCÈS** :
```
IF currentSession.opened === false :
   → BLOCAGE
   → Redirection /marchand
   → Message : "Ouvre ta journée d'abord"
```

**Affichage** :
- Header : ← Retour + "Enregistrer une dépense"
- Formulaire :
  - 📁 **Type de dépense** (Dropdown) :
    - Achat de marchandises
    - Transport
    - Charges (électricité, eau)
    - Personnel
    - Maintenance
    - Autres
  - 💰 **Montant** (Input FCFA)
  - 📝 **Description** (Textarea optionnel)
  - 📅 **Date** (Date picker, défaut = aujourd'hui)
- Bouton : **"Enregistrer"** (rouge)

**Actions** :

**ACTION M5.1** : Clic ← Retour
```
→ NAVIGATION /marchand
→ RETOUR ÉTAPE 102
```

**ACTION M5.2** : Clic **"Enregistrer"**
```
IF montant vide ou invalide :
   → Erreur : "Montant requis"
   → RESTE sur ÉTAPE 105

ELSE :
   → Appel AppContext.addTransaction({
       userId: user.id,
       type: 'depense',
       category: typeDepense,
       amount: montant,
       description,
       timestamp: date
     })
   → Update stats :
      stats.depenses += montant
      stats.caisse -= montant
   → Synthèse vocale : "Dépense de [montant] francs enregistrée"
   → NAVIGATION /marchand
   → RETOUR ÉTAPE 102
```

---

### **ÉTAPE 106 : MODAL - FERMER MA JOURNÉE**
**Composant** : `CloseDayModal`

**Affichage** :
- Titre : "Fermer ma journée"
- Récapitulatif :
  - 💰 Fond de caisse initial : [montant] FCFA
  - ✅ Ventes du jour : [montant] FCFA
  - ❌ Dépenses du jour : [montant] FCFA
  - 📈 Marge nette : [ventes - depenses] FCFA
  - 💵 Caisse finale : [fondInitial + ventes - depenses] FCFA
- Graphique visuel (barre de progression)
- Bouton : **"Confirmer et fermer"** (orange)
- Bouton : **"Annuler"** (gris)

**Actions** :

**ACTION M6.1** : Clic **"Confirmer et fermer"**
```
→ Appel AppContext.closeDay()
→ Archivage session :
   - currentSession.opened = false
   - currentSession.dateFermeture = now
   - Sauvegarde historique (localStorage ou DB)
→ Reset stats temporaires
→ Synthèse vocale : "Ta journée est fermée. À demain !"
→ Fermeture modal
→ TRANSITION ÉTAPE 100 (journée fermée pour le lendemain)
```

**ACTION M6.2** : Clic **"Annuler"**
```
→ Fermeture modal
→ RETOUR ÉTAPE 102
```

---

### **ÉTAPE 110 : MARCHÉ VIRTUEL**
**Route** : `/marchand/marche`  
**Composant** : `MarcheVirtuel.tsx`

**Affichage** :
- Header : "Marché virtuel JULABA"
- Catalogue de produits disponibles
- Filtres : Par catégorie, par zone
- Liste producteurs/coopératives
- Bouton : Commander (workflow à finaliser)

**Actions** :

**ACTION M7.1** : Navigation produits
```
→ Scroll, filtres
→ RESTE sur ÉTAPE 110
```

**ACTION M7.2** : Clic Bottom Bar "Accueil"
```
→ NAVIGATION /marchand
→ RETOUR ÉTAPE 102 ou 100
```

---

### **ÉTAPE 120 : GESTION STOCK**
**Route** : `/marchand/stock` ou `/marchand/produits`  
**Composant** : `GestionStock.tsx`

**Affichage** :
- Header : "Mes produits"
- Bouton : ➕ "Ajouter un produit"
- Liste des produits en tableau :
  - Nom produit
  - Stock actuel (kg/unités)
  - Prix achat
  - Prix vente
  - Marge unitaire
  - Actions : ✏️ Modifier | 🗑️ Supprimer

**Actions** :

**ACTION M8.1** : Clic ➕ "Ajouter un produit"
```
→ Ouverture MODAL AjouterProduitModal
→ Formulaire :
   - Nom
   - Stock initial
   - Prix achat
   - Prix vente
→ Validation → Ajout au stock
→ RETOUR ÉTAPE 120
```

**ACTION M8.2** : Clic ✏️ Modifier produit
```
→ Ouverture MODAL ModifierProduitModal
→ Édition des champs
→ Sauvegarde → RETOUR ÉTAPE 120
```

**ACTION M8.3** : Clic 🗑️ Supprimer
```
→ Modal confirmation : "Supprimer [produit] ?"
→ Si confirmé → Suppression
→ RETOUR ÉTAPE 120
```

---

### **ÉTAPE 130 : PROFIL MARCHAND**
**Route** : `/marchand/profil`  
**Composant** : `MarchandProfil.tsx`

**Affichage** :

**Section 1 : Statistiques rapides** (toujours visible)
- 3 cartes :
  - 📊 Total ventes (lifetime)
  - ❌ Total dépenses
  - 📈 Marge globale

**Section 2 : Informations personnelles** (Accordéon, fermé par défaut)
- Clic header → Expansion
- Affichage :
  - Nom, Prénom
  - Téléphone
  - Marché
  - Zone
- Bouton : ✏️ "Modifier" (toggle mode édition)
- En mode édition : Inputs modifiables + Bouton "Sauvegarder"

**Section 3 : Documents administratifs** (Accordéon, fermé par défaut)
- Liste documents :
  - 📄 Carte d'identité : ✅ Vérifié (badge vert) [Date]
  - 📄 Certification JULABA : ❌ Rejeté (badge rouge) [Date]
  - 📄 Attestation d'activité : 🔴 À compléter (badge orange)
- Clic sur document → Ouverture DocumentModal (ÉTAPE 131)

**Section 4 : Actions rapides**
- 🔔 Notifications
- 🔒 Sécurité (Code PIN)
- 🌍 Langue
- 🔐 Confidentialité

**Section 5 : Carte professionnelle**
- Carte flippable (recto/verso)
- Boutons : 💾 Télécharger | 📤 Partager

**Section 6 : Déconnexion**
- Bouton rouge "Se déconnecter"

**Actions** :

**ACTION M9.1** : Clic accordéon "Informations personnelles"
```
→ Toggle expansion
→ RESTE sur ÉTAPE 130
```

**ACTION M9.2** : Clic ✏️ "Modifier"
```
→ Activation mode édition
→ Inputs deviennent modifiables
→ Bouton change en "Sauvegarder"
→ RESTE sur ÉTAPE 130
```

**ACTION M9.3** : Clic "Sauvegarder"
```
→ Validation champs
→ Appel UserContext.updateUser(newData)
→ Synthèse vocale : "Profil mis à jour"
→ Désactivation mode édition
→ RESTE sur ÉTAPE 130
```

**ACTION M9.4** : Clic document "Carte d'identité" (Vérifié)
```
→ Ouverture DocumentModal
→ ÉTAPE 131 (Mode lecture seule)
```

**ACTION M9.5** : Clic document "Certification JULABA" (Rejeté)
```
→ Ouverture DocumentModal
→ ÉTAPE 132 (Mode re-upload)
```

**ACTION M9.6** : Clic document "Attestation d'activité" (À compléter)
```
→ Ouverture DocumentModal
→ ÉTAPE 133 (Mode upload)
```

**ACTION M9.7** : Clic "Sécurité"
```
→ Ouverture MODAL SecurityCodeModal
→ Configuration code PIN à 4 chiffres
→ RETOUR ÉTAPE 130
```

**ACTION M9.8** : Clic "Se déconnecter"
```
→ Synthèse vocale : "Déconnexion en cours"
→ Appel UserContext.logout()
→ Clear state global
→ Délai 500ms
→ NAVIGATION /login
→ RETOUR ÉTAPE 11
```

---

### **ÉTAPE 131 : DOCUMENT VÉRIFIÉ (Lecture seule)**
**Composant** : `DocumentModal`  
**État document** : `status = 'verified', isLocked = true`

**Affichage** :
- Header : Icône document + Titre "Carte d'identité"
- Badge : 🟢 "Vérifié" + 🔒 "Protégé"
- Message : "Document certifié et protégé"
- Détails : "Vérifié le [date] par [validateur]"
- Image du document avec :
  - Watermark "CERTIFIÉ JULABA" (filigrane)
  - Indicateur cadenas en overlay
- QR Code de vérification (généré automatiquement)
- Actions disponibles :
  - 👁️ Voir en plein écran
  - 💾 Télécharger
  - 📤 Partager
- Message de sécurité : "Document certifié. Contactez JULABA pour modification"

**Actions** :

**ACTION M10.1** : Clic 👁️ Voir en plein écran
```
→ Zoom image (pinch to zoom activé)
→ RESTE sur ÉTAPE 131
```

**ACTION M10.2** : Clic 💾 Télécharger
```
→ Synthèse vocale : "Téléchargement du document certifié"
→ Téléchargement fichier
→ RESTE sur ÉTAPE 131
```

**ACTION M10.3** : Clic 📤 Partager
```
→ Ouverture native share sheet
→ RESTE sur ÉTAPE 131
```

**ACTION M10.4** : Clic ❌ Fermer
```
→ Fermeture modal
→ RETOUR ÉTAPE 130
```

**BLOCAGES** :
- ⛔ Pas de bouton "Remplacer" ou "Supprimer"
- ⛔ Pas de rotation (lecture seule absolue)
- ⛔ isLocked = true empêche toute modification

---

### **ÉTAPE 132 : DOCUMENT REJETÉ (Re-upload possible)**
**État document** : `status = 'rejected', isLocked = false`

**Affichage** :
- Header : Titre + Badge ❌ "Rejeté"
- Message d'erreur : "Document refusé"
- Raison du rejet : "Photo floue - Veuillez reprendre une photo nette avec un bon éclairage"
- Image du document avec overlay rouge semi-transparent
- Badge "REFUSÉ" en surimpression
- Bouton principal : 🔄 **"Charger un nouveau document"** (orange)
- Conseils :
  - "Assurez-vous que le document est bien éclairé et net"
  - "Toutes les informations doivent être lisibles"

**Actions** :

**ACTION M11.1** : Clic 🔄 "Charger un nouveau document"
```
→ Choix : Caméra 📸 ou Galerie 🖼️
→ Sélection fichier
→ Upload en cours (loader)
→ Update document :
   - status = 'pending'
   - imageUrl = nouvelle image
   - uploadedAt = now
   - rejectionReason = null
→ Synthèse vocale : "Document chargé avec succès. En attente de vérification"
→ RESTE sur modal (passage en mode PENDING)
→ Fermeture → RETOUR ÉTAPE 130
```

**ACTION M11.2** : Clic ❌ Fermer
```
→ Fermeture sans modification
→ RETOUR ÉTAPE 130
```

---

### **ÉTAPE 133 : DOCUMENT VIDE (Upload initial)**
**État document** : `status = 'empty', imageUrl = null`

**Affichage** :
- Header : Titre + Badge 🔴 "À compléter"
- Message urgent : "⚠️ Document obligatoire pour activation complète"
- Barre de progression : "2/3 documents complétés"
- 2 boutons d'upload (animation pulsante) :
  - 📸 **"Prendre une photo"** (avec caméra)
  - 🖼️ **"Galerie"** (choisir fichier)
- Conseils de Tantie Sagesse :
  - "Placez votre document à plat sur une surface"
  - "Assurez-vous d'avoir un bon éclairage"
  - "Évitez les reflets et les ombres"

**Actions** :

**ACTION M12.1** : Clic 📸 "Prendre une photo"
```
→ Synthèse vocale : "Ouverture de l'appareil photo. Placez votre document à plat, bien éclairé, sans reflet"
→ Ouverture caméra native (input capture="environment")
→ Prise de photo
→ Upload (loader)
→ Update document :
   - status = 'pending'
   - imageUrl = photo
   - uploadedAt = now
→ Synthèse vocale : "Document chargé avec succès. En attente de vérification"
→ TRANSITION mode PENDING
→ Fermeture → RETOUR ÉTAPE 130
```

**ACTION M12.2** : Clic 🖼️ "Galerie"
```
→ Synthèse vocale : "Ouverture de la galerie"
→ Sélection fichier
→ Workflow identique à M12.1
```

**ACTION M12.3** : Clic ❌ Fermer
```
→ Fermeture sans upload
→ Document reste 'empty'
→ RETOUR ÉTAPE 130
```

---

### **ÉTAPE 134 : DOCUMENT EN ATTENTE (Consultation)**
**État document** : `status = 'pending', isLocked = false`

**Affichage** :
- Badge : 🟠 "En vérification" (avec spinner animé)
- Message : "En cours de vérification par l'équipe JULABA"
- Timeline : "Envoyé le [date] • Validation sous 3-5 jours"
- Image du document (plein écran)
- Bouton : ↻ Rotation (si édition autorisée)
- Indicateur : "Pincer pour zoomer"
- Actions disponibles :
  - 🔄 Remplacer le document
  - 🗑️ Supprimer (avec confirmation PIN)
  - 💾 Télécharger
  - 📤 Partager

**Actions** :

**ACTION M13.1** : Clic ↻ Rotation
```
→ Image rotate +90°
→ Synthèse vocale : "Document tourné"
→ RESTE sur ÉTAPE 134
```

**ACTION M13.2** : Clic 🔄 Remplacer
```
→ Workflow identique à ÉTAPE 133 (Upload)
→ Ancien document écrasé
→ RESTE sur ÉTAPE 134
```

**ACTION M13.3** : Clic 🗑️ Supprimer
```
IF code PIN activé :
   → Ouverture PinConfirmModal
   → ÉTAPE 135
ELSE :
   → Modal confirmation simple
   → Si confirmé :
      → Suppression document
      → status = 'empty'
      → RETOUR ÉTAPE 130
```

---

### **ÉTAPE 135 : CONFIRMATION PIN SUPPRESSION**
**Composant** : `PinConfirmModal`

**Affichage** :
- Icône : ⚠️ AlertTriangle
- Titre : "Supprimer le document"
- Message : "Cette action est irréversible"
- 4 inputs PIN
- Texte : "Entrez votre code de sécurité"

**Actions** :

**ACTION M14.1** : Saisie PIN
```
IF PIN correct :
   → Synthèse vocale : "Code correct. Suppression confirmée"
   → Suppression document
   → status = 'empty', imageUrl = null
   → Fermeture modals
   → RETOUR ÉTAPE 130

ELSE :
   → Synthèse vocale : "Code incorrect"
   → Shake animation
   → Reset inputs
   → RESTE sur ÉTAPE 135
```

**ACTION M14.2** : Clic "Annuler"
```
→ Fermeture modal
→ RETOUR ÉTAPE 134
```

---

## RÉSUMÉ DES BLOCAGES MÉTIER - MARCHAND

| Condition | Blocage | Solution |
|-----------|---------|----------|
| `currentSession.opened = false` | ⛔ "Je vends" désactivé | Ouvrir la journée (ÉTAPE 101) |
| `currentSession.opened = false` | ⛔ "Je dépense" désactivé | Ouvrir la journée (ÉTAPE 101) |
| `document.isLocked = true` | ⛔ Modification/suppression impossible | Contacter admin JULABA |
| `document.status = 'verified'` | ⛔ Upload désactivé | Document protégé |
| Formulaire vente incomplet | ⛔ Enregistrement impossible | Remplir tous les champs |
| PIN incorrect | ⛔ Suppression impossible | Saisir le bon code |

---

---

# 2️⃣ PROFIL PRODUCTEUR 🟢 {#profil-producteur}

**Couleur primaire** : `#2E8B57` (Vert)  
**Base route** : `/producteur`

---

## WORKFLOW P1 : Dashboard Producteur

### **ÉTAPE 200 : DASHBOARD PRODUCTEUR**
**Route** : `/producteur` (index)  
**Composant** : `ProducteurHome.tsx` + `RoleDashboard`

**Affichage** :

**Header** :
- Message : "Enregistre tes récoltes et ventes aujourd'hui"
- Icône 🔊

**KPIs du jour** :
- 🌾 **Récoltes du jour** : [montant] kg
- 💰 **Ventes du jour** : [montant] FCFA

**Actions principales** :
- 🌱 **"J'ai récolté"** (bouton vert) → `/producteur/declarer-recolte`
- 💵 **"J'ai vendu"** (bouton bleu) → `/producteur/vente`

**Score JULABA** :
- Badge circulaire

**Bottom Navigation** :
- 🏠 Accueil
- 🛒 Commandes
- 🌾 Productions
- 👤 Moi

**Actions** :

**ACTION P1.1** : Clic **"J'ai récolté"**
```
→ NAVIGATION /producteur/declarer-recolte
→ ÉTAPE 201
```

**ACTION P1.2** : Clic **"J'ai vendu"**
```
→ NAVIGATION /producteur/vente
→ ÉTAPE 202 (À finaliser)
```

**ACTION P1.3** : Clic Bottom Bar "Commandes"
```
→ NAVIGATION /producteur/commandes
→ ÉTAPE 210
```

**ACTION P1.4** : Clic Bottom Bar "Productions"
```
→ NAVIGATION /producteur/stocks
→ ÉTAPE 220
```

**ACTION P1.5** : Clic Bottom Bar "Moi"
```
→ NAVIGATION /producteur/profil
→ ÉTAPE 230
```

---

### **ÉTAPE 201 : DÉCLARER UNE RÉCOLTE**
**Route** : `/producteur/declarer-recolte`  
**Composant** : `RecolteForm.tsx`

**Affichage** :
- Header : ← Retour + "Déclarer une récolte"
- Formulaire :
  - 🌾 **Produit cultivé** (Dropdown) :
    - Tomate
    - Oignon
    - Piment
    - Aubergine
    - Autres (input libre)
  - ⚖️ **Quantité récoltée** (Input numérique) + unité (kg)
  - 📅 **Date de récolte** (Date picker, défaut = aujourd'hui)
  - ⭐ **Qualité** (Radio buttons) :
    - ✅ Excellent
    - ✅ Bon
    - ⚠️ Moyen
- Bouton : **"Enregistrer la récolte"** (vert)

**État** :
```typescript
formData: {
  produit: '',
  quantite: '',
  date: today,
  qualite: 'bon'
}
```

**Actions** :

**ACTION P2.1** : Clic ← Retour
```
→ NAVIGATION /producteur
→ RETOUR ÉTAPE 200
```

**ACTION P2.2** : Clic **"Enregistrer la récolte"**
```
IF champs incomplets :
   → Erreur : "Remplis tous les champs"
   → RESTE sur ÉTAPE 201

ELSE :
   → Ajout au stock :
      producteurStock[produit] += quantite
   → Enregistrement historique récolte
   → Update KPI "Récoltes du jour"
   → Synthèse vocale : "Récolte de [quantite] kg de [produit] enregistrée"
   → NAVIGATION /producteur
   → RETOUR ÉTAPE 200
```

---

### **ÉTAPE 210 : GESTION DES COMMANDES**
**Route** : `/producteur/commandes`  
**Composant** : `Commandes.tsx`

**Affichage** :
- Header : "Mes commandes"
- Onglets :
  - 🟠 **En attente** (nouvelles commandes)
  - ✅ **Acceptées**
  - 🚚 **En livraison**
  - ✅ **Livrées**
  - ❌ **Refusées**
- Liste des commandes (cards) :
  - Client : [Nom marchand ou coopérative]
  - Produit : [Nom produit]
  - Quantité : [kg]
  - Prix proposé : [FCFA/kg]
  - Date demande
  - Boutons (selon statut) :
    - Si EN ATTENTE : ✅ Accepter | ❌ Refuser
    - Si ACCEPTÉE : 🚚 Marquer livrée
    - Si LIVRÉE : 👁️ Voir détails

**Actions** :

**ACTION P3.1** : Clic ✅ Accepter commande
```
→ Modal confirmation : "Accepter cette commande ?"
→ Si confirmé :
   → Update commande.status = 'acceptée'
   → Notification client (marchand/coop)
   → Synthèse vocale : "Commande acceptée"
   → RESTE sur ÉTAPE 210
```

**ACTION P3.2** : Clic ❌ Refuser commande
```
→ Modal : "Raison du refus ?" (optionnel)
→ Si confirmé :
   → Update commande.status = 'refusée'
   → Notification client
   → Synthèse vocale : "Commande refusée"
   → RESTE sur ÉTAPE 210
```

**ACTION P3.3** : Clic 🚚 Marquer livrée
```
→ Modal confirmation + photo preuve livraison (optionnel)
→ Si confirmé :
   → Update commande.status = 'livrée'
   → Trigger paiement (si pas déjà fait)
   → Update stock : producteurStock[produit] -= quantite
   → Synthèse vocale : "Livraison confirmée"
   → RESTE sur ÉTAPE 210
```

---

### **ÉTAPE 220 : STOCKS ET PRODUCTIONS**
**Route** : `/producteur/stocks`  
**Composant** : `StocksWrapper.tsx` + `Stocks.tsx`

**Affichage** :
- Header : "Mes productions"
- Tableau :
  - Produit
  - Stock disponible (kg)
  - Récolté ce mois (kg)
  - Vendu ce mois (kg)
  - Prix moyen/kg (FCFA)
- Métriques globales :
  - Volume total disponible
  - Taux de rotation
  - Revenus prévisionnels

**Actions** :

**ACTION P4.1** : Navigation stocks
```
→ Consultation données
→ RESTE sur ÉTAPE 220
```

---

### **ÉTAPE 230 : PROFIL PRODUCTEUR**
**Route** : `/producteur/profil` ou `/producteur/mon-profil`  
**Composant** : `ProducteurProfilHarmonise.tsx` + `Profil.tsx`

**Affichage** :
- Similaire au profil Marchand
- Sections spécifiques :
  - Type de cultures
  - Localisation parcelles
  - Équipements
  - Coopérative(s) d'appartenance
- Documents administratifs (même système)
- Actions rapides
- Déconnexion

**Actions** :
- Identiques au Marchand (ÉTAPE 130 et suivantes)
- Documents gérés via DocumentModal

---

## RÉSUMÉ DES BLOCAGES MÉTIER - PRODUCTEUR

| Condition | Blocage | Solution |
|-----------|---------|----------|
| Stock insuffisant | ⛔ Accepter commande impossible | Déclarer nouvelles récoltes |
| Commande déjà acceptée | ⛔ Modification impossible | Contacter client |
| Document non vérifié | ⛔ Visibilité marketplace limitée | Compléter documents |

---

---

# 3️⃣ PROFIL COOPÉRATIVE 🔵 {#profil-cooperative}

**Couleur primaire** : `#2072AF` (Bleu)  
**Base route** : `/cooperative`

---

## WORKFLOW C1 : Dashboard Coopérative

### **ÉTAPE 300 : DASHBOARD COOPÉRATIVE**
**Route** : `/cooperative` (index)  
**Composant** : `CooperativeHome.tsx`

**Affichage** :

**Header** :
- Message : "Gère tes membres et stocks communs"

**KPIs** :
- 📦 **Volume groupé** : [total kg]
- 💰 **Transactions** : [montant FCFA]

**Actions principales** :
- 🛒 **"Achats groupés"**
- 📤 **"Ventes groupées"**

**Bottom Navigation** :
- 🏠 Accueil
- 👥 Membres
- 📦 Stocks
- 👤 Moi

**Actions** :

**ACTION C1.1** : Clic Bottom Bar "Membres"
```
→ NAVIGATION /cooperative/membres
→ ÉTAPE 310
```

**ACTION C1.2** : Clic Bottom Bar "Stocks"
```
→ NAVIGATION /cooperative/stocks
→ ÉTAPE 320
```

**ACTION C1.3** : Clic Bottom Bar "Moi"
```
→ NAVIGATION /cooperative/profil
→ ÉTAPE 330
```

---

### **ÉTAPE 310 : GESTION DES MEMBRES**
**Route** : `/cooperative/membres`  
**Composant** : `Membres.tsx`

**Affichage** :
- Header : "Nos membres"
- Bouton : ➕ "Ajouter un membre"
- Tableau membres :
  - Photo + Nom
  - Rôle (Producteur, Président, Trésorier...)
  - Contributions (kg ou FCFA)
  - Statut (Actif, Inactif, Suspendu)
  - Actions : 👁️ Voir | ✏️ Modifier | 🗑️ Retirer

**Actions** :

**ACTION C2.1** : Clic ➕ "Ajouter un membre"
```
→ Modal AjouterMembreModal
→ Formulaire :
   - Recherche par téléphone (si déjà sur JULABA)
   - OU Nouveau membre (création compte)
   - Rôle dans la coopérative
   - Quota contributions
→ Validation → Ajout membre
→ RETOUR ÉTAPE 310
```

**ACTION C2.2** : Clic 👁️ Voir membre
```
→ Modal détails membre
→ Historique contributions
→ Statistiques individuelles
→ RETOUR ÉTAPE 310
```

**ACTION C2.3** : Clic ✏️ Modifier
```
→ Modal édition
→ Modification rôle, quota
→ RETOUR ÉTAPE 310
```

**ACTION C2.4** : Clic 🗑️ Retirer membre
```
→ Modal confirmation : "Retirer [Nom] de la coopérative ?"
→ Raison obligatoire
→ Si confirmé :
   → Update membre.statut = 'retiré'
   → Archivage historique
   → Notification membre
   → RETOUR ÉTAPE 310
```

---

### **ÉTAPE 320 : STOCKS COMMUNS**
**Route** : `/cooperative/stock` ou `/cooperative/stocks`  
**Composant** : `Stock.tsx`

**Affichage** :
- Header : "Stocks groupés"
- Vue consolidée tous stocks membres
- Tableau :
  - Produit
  - Stock total (somme tous membres)
  - Répartition par membre
  - Disponible pour vente groupée
- Bouton : "Lancer vente groupée"

**Actions** :

**ACTION C3.1** : Clic produit
```
→ Modal détails
→ Affichage répartition :
   - Membre A : 120 kg
   - Membre B : 80 kg
   - TOTAL : 200 kg
→ RETOUR ÉTAPE 320
```

**ACTION C3.2** : Clic "Lancer vente groupée"
```
→ Modal configuration vente
→ Sélection produit + quantité + prix
→ Publication sur marketplace
→ RETOUR ÉTAPE 320
```

---

### **ÉTAPE 330 : PROFIL COOPÉRATIVE**
**Route** : `/cooperative/profil`  
**Composant** : `CooperativeProfil.tsx`

**Affichage** :
- Informations :
  - Nom coopérative
  - Président
  - Nombre de membres
  - Zone d'activité
  - Agrément officiel
- Documents administratifs
- Actions rapides
- Déconnexion

**Actions** :
- Similaires au Marchand

---

## RÉSUMÉ DES BLOCAGES MÉTIER - COOPÉRATIVE

| Condition | Blocage | Solution |
|-----------|---------|----------|
| < 3 membres | ⛔ Vente groupée impossible | Recruter membres |
| Stock insuffisant | ⛔ Commande groupée impossible | Augmenter contributions |
| Président non défini | ⛔ Certaines actions bloquées | Élire président |

---

---

# 4️⃣ PROFIL IDENTIFICATEUR 🟤 {#profil-identificateur}

**Couleur primaire** : `#9F8170` (Beige/Taupe)  
**Base route** : `/identificateur`

---

## WORKFLOW I1 : Dashboard Identificateur

### **ÉTAPE 400 : DASHBOARD IDENTIFICATEUR**
**Route** : `/identificateur` (index)  
**Composant** : `IdentificateurHome.tsx`  
**Layout** : `IdentificateurLayout.tsx` (layout spécifique)

**Affichage** :

**Header** :
- Message : "Identifie les nouveaux acteurs JULABA"

**KPIs** :
- ✅ **Validations du jour** : [nombre]
- ⏳ **En attente** : [nombre demandes]

**Actions principales** :
- ➕ **"Nouveau marchand"** → Formulaire identification marchand
- 🌱 **"Nouveau producteur"** → Formulaire identification producteur

**Bottom Navigation** :
- 🏠 Accueil
- ✅ Identifications
- 📊 Rapports
- 👤 Moi

**Actions** :

**ACTION I1.1** : Clic **"Nouveau marchand"**
```
→ NAVIGATION /identificateur/formulaire-identification-marchand
→ ÉTAPE 401
```

**ACTION I1.2** : Clic **"Nouveau producteur"**
```
→ NAVIGATION /identificateur/nouveau-producteur
→ ÉTAPE 402 (À implémenter)
```

**ACTION I1.3** : Clic Bottom Bar "Identifications"
```
→ NAVIGATION /identificateur/identifications
→ ÉTAPE 410
```

**ACTION I1.4** : Clic Bottom Bar "Rapports"
```
→ NAVIGATION /identificateur/rapports
→ ÉTAPE 420
```

**ACTION I1.5** : Clic Bottom Bar "Moi"
```
→ NAVIGATION /identificateur/profil
→ ÉTAPE 430
```

---

### **ÉTAPE 401 : FORMULAIRE IDENTIFICATION MARCHAND (Étape 1/4)**
**Route** : `/identificateur/formulaire-identification-marchand`  
**Composant** : `FormulaireIdentificationMarchand.tsx`

**Affichage** :
- Progress bar : 1/4 (25%)
- Titre : "Informations personnelles"
- Formulaire :
  - 👤 **Nom** (Input texte)
  - 👤 **Prénom** (Input texte)
  - 📱 **Téléphone** (Input format ivoirien)
  - 📍 **Commune** (Dropdown)
  - 🏘️ **Quartier** (Input texte)
  - 🏪 **Marché d'activité** (Dropdown ou autocomplete)
- Bouton : **"Suivant"** (désactivé si incomplet)
- Bouton : **"Annuler"** (retour dashboard)

**État** :
```typescript
step: 1
formData: {
  nom: '',
  prenom: '',
  telephone: '',
  commune: '',
  quartier: '',
  marche: ''
}
```

**Actions** :

**ACTION I2.1** : Saisie des champs
```
→ Validation temps réel
→ Téléphone : Format 07XXXXXXXX ou 05XXXXXXXX
→ Activation bouton "Suivant" si tous remplis
→ RESTE sur ÉTAPE 401
```

**ACTION I2.2** : Clic **"Suivant"**
```
IF champs incomplets :
   → Erreur : "Remplis tous les champs obligatoires"
   → Highlight champs manquants
   → RESTE sur ÉTAPE 401

ELSE :
   → Sauvegarde formData partiel
   → step = 2
   → TRANSITION ÉTAPE 401b
```

**ACTION I2.3** : Clic **"Annuler"**
```
→ Modal confirmation : "Abandonner l'identification ?"
→ Si confirmé :
   → Reset formData
   → NAVIGATION /identificateur
   → RETOUR ÉTAPE 400
```

---

### **ÉTAPE 401b : FORMULAIRE IDENTIFICATION (Étape 2/4)**
**Progress** : 2/4 (50%)

**Affichage** :
- Titre : "Activité commerciale"
- Formulaire :
  - 🏪 **Type de commerce** (Radio buttons) :
    - Vente produits vivriers
    - Vente détail
    - Commerce ambulant
    - Autre (spécifier)
  - 🌾 **Produits vendus** (Multi-select checkboxes) :
    - Tomate
    - Oignon
    - Piment
    - Riz
    - Autres (input libre)
  - 📅 **Ancienneté** (Dropdown) :
    - < 1 an
    - 1-3 ans
    - 3-5 ans
    - > 5 ans
  - 🚶 **Emplacement** (Radio) :
    - Fixe
    - Ambulant
- Boutons : **← Retour** | **Suivant →**

**Actions** :

**ACTION I3.1** : Clic **← Retour**
```
→ step = 1
→ RETOUR ÉTAPE 401
```

**ACTION I3.2** : Clic **Suivant →**
```
→ Sauvegarde formData
→ step = 3
→ TRANSITION ÉTAPE 401c
```

---

### **ÉTAPE 401c : FORMULAIRE IDENTIFICATION (Étape 3/4)**
**Progress** : 3/4 (75%)

**Affichage** :
- Titre : "Documents et photos"
- Instructions : "Prends des photos claires et nettes"
- 3 captures photos :
  - 📸 **Photo carte d'identité** (OBLIGATOIRE)
    - Bouton : Caméra | Galerie
    - Preview si chargée
  - 📸 **Photo du marchand** (OBLIGATOIRE)
    - Selfie ou photo portrait
  - 📸 **Photo de l'emplacement** (OPTIONNEL)
    - Photo du stand/boutique
- Boutons : **← Retour** | **Suivant →**

**État** :
```typescript
photos: {
  carteIdentite: null,
  marchand: null,
  emplacement: null
}
```

**Actions** :

**ACTION I4.1** : Clic **Caméra** (Carte d'identité)
```
→ Synthèse vocale : "Place la carte d'identité à plat, bien éclairée"
→ Ouverture caméra native
→ Capture photo
→ Preview photo
→ Choix : Garder | Reprendre
→ Si Garder :
   → photos.carteIdentite = imageData
   → Synthèse vocale : "Photo carte d'identité enregistrée"
   → RESTE sur ÉTAPE 401c
```

**ACTION I4.2** : Clic **Galerie**
```
→ Sélection fichier
→ Workflow identique
```

**ACTION I4.3** : Clic **Suivant →**
```
IF photos.carteIdentite === null OU photos.marchand === null :
   → Erreur : "Photos obligatoires manquantes"
   → RESTE sur ÉTAPE 401c

ELSE :
   → Sauvegarde photos
   → step = 4
   → TRANSITION ÉTAPE 401d
```

---

### **ÉTAPE 401d : FORMULAIRE IDENTIFICATION (Étape 4/4)**
**Progress** : 4/4 (100%)

**Affichage** :
- Titre : "Récapitulatif et validation"
- Affichage complet de toutes les données :
  - **Informations personnelles** (section)
  - **Activité commerciale** (section)
  - **Documents** (gallery 3 photos)
- Checkbox : ☑️ "Je certifie l'exactitude des informations"
- Signature numérique :
  - Canvas pour signature tactile
  - Bouton : Effacer
- Boutons : **← Retour** | **✅ Valider et envoyer**

**État** :
```typescript
certified: false
signature: null
```

**Actions** :

**ACTION I5.1** : Clic checkbox certification
```
→ certified = true
→ Activation bouton "Valider et envoyer"
→ RESTE sur ÉTAPE 401d
```

**ACTION I5.2** : Signature sur canvas
```
→ Capture signature
→ signature = signatureData
→ RESTE sur ÉTAPE 401d
```

**ACTION I5.3** : Clic **✅ Valider et envoyer**
```
IF certified === false :
   → Erreur : "Tu dois certifier les informations"
   → RESTE sur ÉTAPE 401d

ELSE IF signature === null :
   → Erreur : "Signature requise"
   → RESTE sur ÉTAPE 401d

ELSE :
   → Compilation données complètes :
      newMarchand = {
        ...formData,
        photos,
        signature,
        identificateurId: currentUser.id,
        identificateurName: currentUser.fullName,
        dateIdentification: now,
        status: 'en_attente_validation_admin',
        numeroJulaba: generateNumeroJulaba() // Auto-généré
      }
   → Sauvegarde en base (ou localStorage)
   → Génération SMS au marchand :
      "Ton inscription JULABA est en cours. Numéro : [numeroJulaba]. Validation sous 48h."
   → Synthèse vocale : "Identification enregistrée avec succès"
   → NAVIGATION /identificateur/fiche-marchand?id=[newMarchand.id]
   → TRANSITION ÉTAPE 403
```

---

### **ÉTAPE 403 : FICHE MARCHAND (Récapitulatif)**
**Route** : `/identificateur/fiche-marchand?id=[id]`  
**Composant** : `FicheMarchand.tsx`

**Affichage** :
- Header : "Fiche Marchand"
- Sous-titre : "Identification complétée"
- Numéro JULABA : **MARCH-2024-XXXX** (bien visible)
- Toutes les informations :
  - Identité
  - Activité
  - Photos (gallery)
  - Signature
- Badge statut : 🟠 "En attente de validation admin"
- Boutons :
  - 📄 "Télécharger PDF"
  - 📤 "Partager"
  - ✏️ "Modifier" (si pas encore validé)
  - 🏠 "Retour accueil"

**Actions** :

**ACTION I6.1** : Clic 📄 "Télécharger PDF"
```
→ Génération PDF de la fiche
→ Téléchargement
→ RESTE sur ÉTAPE 403
```

**ACTION I6.2** : Clic 📤 "Partager"
```
→ Native share sheet
→ Partage lien ou PDF
→ RESTE sur ÉTAPE 403
```

**ACTION I6.3** : Clic ✏️ "Modifier"
```
IF statut === 'validé_admin' :
   → Erreur : "Modification impossible après validation"
   → RESTE sur ÉTAPE 403

ELSE :
   → RETOUR ÉTAPE 401 (step 1)
   → formData pré-rempli
```

**ACTION I6.4** : Clic 🏠 "Retour accueil"
```
→ NAVIGATION /identificateur
→ RETOUR ÉTAPE 400
```

---

### **ÉTAPE 410 : LISTE DES IDENTIFICATIONS**
**Route** : `/identificateur/identifications`  
**Composant** : `Identifications.tsx`

**Affichage** :
- Header : "Mes identifications"
- Filtres (tabs) :
  - 📋 Toutes
  - ⏳ En attente
  - ✅ Validées
  - ❌ Rejetées
- Liste des fiches créées (cards) :
  - Photo + Nom
  - Numéro JULABA
  - Date identification
  - Statut (badge coloré)
  - Bouton : 👁️ Voir la fiche

**Actions** :

**ACTION I7.1** : Clic filtre
```
→ Filtrage liste
→ RESTE sur ÉTAPE 410
```

**ACTION I7.2** : Clic 👁️ Voir la fiche
```
→ NAVIGATION /identificateur/fiche-marchand?id=[id]
→ TRANSITION ÉTAPE 403
```

---

### **ÉTAPE 420 : RAPPORTS ET STATS**
**Route** : `/identificateur/rapports`  
**Composant** : `Rapports.tsx`

**Affichage** :
- Header : "Mes rapports"
- KPIs :
  - Total identifications (lifetime)
  - Ce mois
  - Cette semaine
  - Aujourd'hui
- Graphiques :
  - Évolution par jour
  - Répartition par marché
  - Taux de validation
- Objectif mensuel :
  - Barre de progression : 15/20 identifications
  - Message : "5 identifications restantes pour atteindre l'objectif"

**Actions** :
- Consultation uniquement

---

### **ÉTAPE 430 : PROFIL IDENTIFICATEUR**
**Route** : `/identificateur/profil`  
**Composant** : `IdentificateurProfil.tsx`

**Affichage** :
- Informations :
  - Zone d'affectation
  - Marché(s) couverts
  - Performance
- Documents (badge, accréditation)
- Actions rapides
- Déconnexion

---

## RÉSUMÉ DES BLOCAGES MÉTIER - IDENTIFICATEUR

| Condition | Blocage | Solution |
|-----------|---------|----------|
| Photos manquantes | ⛔ Validation impossible | Capturer photos obligatoires |
| Signature manquante | ⛔ Envoi impossible | Signer sur canvas |
| Fiche déjà validée | ⛔ Modification impossible | Contacter admin |

---

---

# 5️⃣ PROFIL INSTITUTION/ADMIN 🟣 {#profil-institution}

**Couleur primaire** : `#712864` (Violet)  
**Base route** : `/institution`

---

## WORKFLOW A1 : Dashboard Institution

### **ÉTAPE 500 : DASHBOARD INSTITUTION (Mobile)**
**Route** : `/institution` (index)  
**Composant** : `InstitutionHome.tsx`

**Affichage** :

**Header** :
- Message : "Supervise l'ensemble de la plateforme JULABA"

**KPIs globaux** :
- 👥 **Utilisateurs actifs** : [nombre total]
- 💰 **Volume total** : [montant FCFA]

**Actions principales** :
- 👥 **"Gestion utilisateurs"** → Liste complète
- 📊 **"Analytics"** → Tableaux de bord

**Bottom Navigation** :
- 🏠 Accueil
- 📊 Analytics
- 👥 Acteurs
- 👤 Moi

**Actions** :

**ACTION A1.1** : Clic **"Gestion utilisateurs"**
```
→ NAVIGATION /institution/acteurs
→ ÉTAPE 510
```

**ACTION A1.2** : Clic **"Analytics"**
```
→ NAVIGATION /institution/analytics
→ ÉTAPE 520
```

**ACTION A1.3** : Clic Bottom Bar "Analytics"
```
→ NAVIGATION /institution/analytics
→ ÉTAPE 520
```

**ACTION A1.4** : Clic Bottom Bar "Acteurs"
```
→ NAVIGATION /institution/acteurs
→ ÉTAPE 510
```

---

### **ÉTAPE 501 : DASHBOARD INSTITUTION (Desktop - Full Screen)**
**Route** : `/institution/dashboard`  
**Composant** : `Dashboard.tsx`

**SPÉCIFICITÉ** : Vue desktop uniquement, non responsive mobile

**Affichage** :
- Layout full screen
- Sidebar gauche :
  - Navigation principale
  - KPIs rapides
- Zone centrale :
  - Graphiques temps réel (Recharts)
  - Carte de Côte d'Ivoire avec données géolocalisées
  - Tendances et prévisions
- Panel droit :
  - Alertes
  - Actions rapides
  - Notifications

**Actions** :
- Navigation complexe
- Export de données
- Configuration avancée

---

### **ÉTAPE 510 : GESTION DES ACTEURS**
**Route** : `/institution/acteurs`  
**Composant** : `Acteurs.tsx`

**Affichage** :
- Header : "Gestion des acteurs"
- Barre de recherche globale
- Filtres avancés :
  - Par rôle (dropdown) :
    - Tous
    - Marchands
    - Producteurs
    - Coopératives
    - Identificateurs
  - Par région (dropdown)
  - Par statut :
    - Actif
    - En attente de validation
    - Suspendu
    - Inactif
  - Par score JULABA (slider)
  - Par date d'inscription (date range)
- Tableau des utilisateurs :
  - Photo + Nom
  - Rôle (badge coloré)
  - Téléphone
  - Région
  - Score
  - Statut
  - Date inscription
  - Actions : 👁️ Voir | ✏️ Modifier | 🔒 Suspendre | ✅ Valider

**Pagination** : 20 par page

**Actions** :

**ACTION A2.1** : Recherche utilisateur
```
→ Filtrage temps réel
→ RESTE sur ÉTAPE 510
```

**ACTION A2.2** : Application filtres
```
→ Update liste selon critères
→ RESTE sur ÉTAPE 510
```

**ACTION A2.3** : Clic 👁️ Voir utilisateur
```
→ Modal détails complets :
   - Toutes informations
   - Historique activité
   - Documents
   - Transactions
→ Fermeture → RETOUR ÉTAPE 510
```

**ACTION A2.4** : Clic ✏️ Modifier
```
→ Modal édition :
   - Informations modifiables
   - Changement de rôle (avec confirmation)
   - Ajustement score
→ Sauvegarde → Update
→ RETOUR ÉTAPE 510
```

**ACTION A2.5** : Clic 🔒 Suspendre compte
```
→ Modal confirmation : "Suspendre [Nom] ?"
→ Raison obligatoire (textarea)
→ Si confirmé :
   → user.status = 'suspendu'
   → Blocage accès plateforme
   → Notification utilisateur (SMS/Email)
   → RETOUR ÉTAPE 510
```

**ACTION A2.6** : Clic ✅ Valider (identification en attente)
```
IF user.status === 'en_attente_validation' :
   → Modal récapitulatif identification :
      - Toutes infos saisies par identificateur
      - Photos documents
      - Signature
   → Choix :
      ✅ Approuver → user.status = 'actif'
                  → Création compte complet
                  → Envoi SMS : "Ton compte JULABA est activé !"
                  → RETOUR ÉTAPE 510
      
      ❌ Rejeter → Raison obligatoire
                → user.status = 'rejeté'
                → Notification identificateur + utilisateur
                → RETOUR ÉTAPE 510

ELSE :
   → Message : "Cet utilisateur n'est pas en attente"
   → RESTE sur ÉTAPE 510
```

---

### **ÉTAPE 520 : ANALYTICS**
**Route** : `/institution/analytics`  
**Composant** : `Analytics.tsx`

**Affichage** :
- Header : "Analytics JULABA"
- Sélecteur période :
  - Aujourd'hui
  - Cette semaine
  - Ce mois
  - Cette année
  - Personnalisé (date range)
- Sections :
  
  **1. Vue d'ensemble** :
  - Total utilisateurs
  - Croissance %
  - Volume transactions (FCFA)
  - Taux d'activité
  
  **2. Répartition par rôle** (Pie chart) :
  - Marchands : X%
  - Producteurs : Y%
  - Coopératives : Z%
  
  **3. Répartition géographique** (Bar chart) :
  - Par région
  - Par commune
  - Top 10 marchés
  
  **4. Produits les plus échangés** (Bar chart horizontal) :
  - Tomate : X kg
  - Oignon : Y kg
  - ...
  
  **5. Performance identificateurs** :
  - Top 5 identificateurs par nb d'identifications
  - Taux de validation moyen
  
  **6. Tendances** (Line chart) :
  - Évolution quotidienne utilisateurs actifs
  - Évolution volume transactions

**Actions** :

**ACTION A3.1** : Changement période
```
→ Refresh données
→ Update tous graphiques
→ RESTE sur ÉTAPE 520
```

**ACTION A3.2** : Clic sur élément graphique
```
→ Drill-down détails
→ Modal ou page détaillée
→ RETOUR ÉTAPE 520
```

**ACTION A3.3** : Export données
```
→ Bouton "Exporter" (en haut à droite)
→ Choix format : PDF | Excel | CSV
→ Génération fichier
→ Téléchargement
→ RESTE sur ÉTAPE 520
```

---

### **ÉTAPE 530 : PROFIL INSTITUTION**
**Route** : `/institution/profil`  
**Composant** : `InstitutionProfil.tsx`

**Affichage** :
- Informations :
  - Nom institution
  - Responsable
  - Périmètre supervision
- Documents officiels
- Paramètres plateforme
- Déconnexion

---

## RÉSUMÉ DES BLOCAGES MÉTIER - INSTITUTION

| Condition | Blocage | Solution |
|-----------|---------|----------|
| Utilisateur déjà validé | ⛔ Re-validation impossible | Action déjà effectuée |
| Compte suspendu | ⛔ Réactivation requiert raison | Documenter réactivation |
| Pas de permissions | ⛔ Actions admin bloquées | Vérifier rôle utilisateur |

---

---

# 📊 TABLEAU RÉCAPITULATIF DES TRANSITIONS

## Arborescence complète des routes

```
/ (Login)
├─ /onboarding (screens -1 à 3)
├─ /login (ÉTAPE 11-12)
├─ /inscription (ÉTAPE 20 - Non finalisée)
│
├─ /marchand (ÉTAPE 100-135)
│  ├─ /vendre (ÉTAPE 104)
│  ├─ /caisse (POSCaisse)
│  ├─ /depenses (ÉTAPE 105)
│  ├─ /marche (ÉTAPE 110)
│  ├─ /stock (ÉTAPE 120)
│  ├─ /profil (ÉTAPE 130-135)
│  ├─ /ventes-passees
│  └─ /resume-caisse
│
├─ /producteur (ÉTAPE 200-230)
│  ├─ /declarer-recolte (ÉTAPE 201)
│  ├─ /commandes (ÉTAPE 210)
│  ├─ /stocks (ÉTAPE 220)
│  └─ /profil (ÉTAPE 230)
│
├─ /cooperative (ÉTAPE 300-330)
│  ├─ /membres (ÉTAPE 310)
│  ├─ /stock (ÉTAPE 320)
│  └─ /profil (ÉTAPE 330)
│
├─ /identificateur (ÉTAPE 400-430)
│  ├─ /formulaire-identification-marchand (ÉTAPE 401a-d)
│  ├─ /fiche-marchand (ÉTAPE 403)
│  ├─ /identifications (ÉTAPE 410)
│  ├─ /rapports (ÉTAPE 420)
│  └─ /profil (ÉTAPE 430)
│
└─ /institution (ÉTAPE 500-530)
   ├─ /dashboard (ÉTAPE 501 - Desktop)
   ├─ /acteurs (ÉTAPE 510)
   ├─ /analytics (ÉTAPE 520)
   └─ /profil (ÉTAPE 530)
```

---

# 🎯 POINTS CLÉS À RETENIR

## Conditions de blocage universelles

1. **Journée fermée (Marchand uniquement)** :
   - ⛔ "Je vends" et "Je dépense" désactivés
   - ✅ Solution : Ouvrir la journée (fond de caisse)

2. **Document verrouillé (`isLocked = true`)** :
   - ⛔ Modification/suppression impossibles
   - ✅ État : Documents vérifiés (`status = 'verified'`)

3. **Formulaire incomplet** :
   - ⛔ Boutons "Suivant" ou "Enregistrer" désactivés
   - ✅ Validation temps réel des champs

4. **Compte en attente** :
   - ⛔ Accès limité jusqu'à validation admin
   - ✅ Workflow : Identificateur → Admin → Activation

## Transitions automatiques

- **Onboarding splash** : 2s → Écran 0
- **Login OTP** : Auto-validation quand 4 chiffres
- **Redirection post-login** : 500ms selon rôle
- **Coach mark** : Apparition après 5s si journée fermée

## Synthèse vocale (Tantie Sagesse)

- **Présente partout** : FAB fixe en bas à droite
- **Contextuelle** : Messages adaptés à chaque écran
- **Proactive** : Annonces automatiques (coach mark, bienvenue)
- **Interactive** : Lit les messages, confirme les actions

---

**FIN DU DOCUMENT**

**Dernière mise à jour** : Mars 2026  
**Version** : 1.0.0  
**Auteur** : Documentation technique JULABA
