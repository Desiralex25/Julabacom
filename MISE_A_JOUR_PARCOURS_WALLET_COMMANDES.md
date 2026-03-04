# 🔄 MISE À JOUR PARCOURS UTILISATEURS - WALLET & COMMANDES

**Date** : Mars 2026  
**Version** : 2.0.0  
**Type** : Enrichissement des parcours avec nouveaux systèmes

---

## 📋 NOUVEAUX PARCOURS À INTÉGRER

Cette mise à jour ajoute les workflows **Wallet** et **Commandes** dans tous les profils concernés.

---

# 💰 PARCOURS WALLET (Tous profils)

## WORKFLOW W1 : Recharger le Wallet

### **ÉTAPE W100 : DASHBOARD - VOIR WALLET CARD**
**Contexte** : Accessible depuis tous les dashboards (Marchand, Producteur, Coopérative)

**Affichage WalletCard** :
- Carte noire avec dégradé
- Solde disponible : [montant] FCFA
- Si escrow > 0 : Badge orange "En attente de livraison : [montant] FCFA"
- Bouton 🔽 **"Recharger"**
- Bouton 🔼 **"Retirer"**
- Toggle 👁️ Masquer/Afficher solde

**Actions** :

**ACTION W1.1** : Clic 👁️ Toggle
```
→ showBalance = !showBalance
→ Affichage : "••••••" ou montant
→ Synthèse vocale : "Solde masqué" / "Solde affiché"
→ RESTE sur dashboard
```

**ACTION W1.2** : Clic **"Recharger"**
```
→ Ouverture MODAL RechargeWalletModal
→ TRANSITION ÉTAPE W101
```

**ACTION W1.3** : Clic **"Retirer"**
```
→ Synthèse vocale : "Fonction retrait bientôt disponible"
→ TODO: Ouvrir modal retrait
→ RESTE sur dashboard
```

---

### **ÉTAPE W101 : MODAL - RECHARGER WALLET**
**Composant** : `RechargeWalletModal`

**Affichage** :
- Header : Icône Wallet + "Recharger Wallet - Depuis Mobile Money"
- **Sélection provider** (4 boutons) :
  - 🟠 Orange Money
  - 🟡 MTN Mobile Money
  - 🔵 Moov Money
  - 🟢 Wave
- Input : Numéro Mobile Money (10 chiffres)
- Input : Montant (FCFA)
- **Montants rapides** (6 boutons) :
  - 1K | 2K | 5K | 10K | 20K | 50K
- Info : 🔒 "Transaction sécurisée. Code de confirmation sur votre téléphone"
- Boutons : **Annuler** | **Recharger**

**État** :
```typescript
montant: ''
provider: 'ORANGE'
numeroMobileMoney: ''
loading: false
error: ''
```

**Actions** :

**ACTION W2.1** : Clic provider (ex: MTN)
```
→ provider = 'MTN'
→ RESTE sur ÉTAPE W101
```

**ACTION W2.2** : Clic montant rapide (ex: 10K)
```
→ montant = '10000'
→ RESTE sur ÉTAPE W101
```

**ACTION W2.3** : Clic **"Recharger"**
```
IF montant invalide (< 0 ou vide) :
   → Erreur : "Montant invalide"
   → Synthèse vocale : "Montant invalide"
   → RESTE sur ÉTAPE W101

ELSE IF montant % 100 !== 0 :
   → Erreur : "Le montant doit être un multiple de 100 FCFA"
   → Synthèse vocale : "Le montant doit être un multiple de 100 francs"
   → RESTE sur ÉTAPE W101

ELSE IF numeroMobileMoney.length !== 10 :
   → Erreur : "Numéro Mobile Money invalide"
   → Synthèse vocale : "Numéro Mobile Money invalide"
   → RESTE sur ÉTAPE W101

ELSE :
   → loading = true
   → Simuler délai API (2s)
   → Appel WalletContext.rechargerWallet(montant, provider, reference)
   → Update wallet :
      wallet.balance += montant
      wallet.totalReceived += montant
   → Création WalletTransaction :
      type: 'RECHARGE'
      amount: montant
      status: 'COMPLETED'
   → Synthèse vocale : "Wallet rechargé avec succès. [montant] francs CFA"
   → Fermeture modal
   → RETOUR dashboard (wallet mis à jour)
```

**ACTION W2.4** : Clic **"Annuler"**
```
→ Fermeture modal
→ RETOUR dashboard
```

**CONDITION DE BLOCAGE** :
- ⛔ Bouton "Recharger" désactivé si montant vide OU numeroMobileMoney vide

---

## WORKFLOW W2 : Retrait Wallet (À implémenter)

*TODO : Modal RetiraitWalletModal avec workflow similaire*

---

---

# 📦 PARCOURS COMMANDES (3 SCÉNARIOS)

## SCÉNARIO 1 : COMMANDE DIRECTE (Marchand → Producteur)

### **ÉTAPE CMD100 : MARCHAND CRÉE COMMANDE**
**Route** : `/marchand/passer-commande` (nouvelle route à créer)

**Affichage** :
- Header : "Passer une commande"
- Formulaire :
  - **Producteur** : Dropdown (liste producteurs disponibles)
  - **Produit** : Input texte ou dropdown
  - **Quantité** : Input numérique (kg)
  - **Prix proposé** : Input FCFA/kg
  - Calcul auto : **Total = Quantité × Prix**
- Bouton : **"Envoyer la demande"** (orange)

**Actions** :

**ACTION CMD1.1** : Clic **"Envoyer la demande"**
```
→ Appel CommandeContext.creerCommandeDirecte()
→ Création commande :
   - status: EN_ATTENTE
   - prixInitial: [prix saisi]
   - expiresAt: +24h ouvrées
→ Notification Producteur : "Nouvelle commande de [Marchand]"
→ Synthèse vocale : "Commande envoyée au producteur"
→ NAVIGATION /marchand/mes-commandes
→ TRANSITION ÉTAPE CMD101
```

---

### **ÉTAPE CMD101 : MARCHAND - COMMANDE EN ATTENTE**
**Route** : `/marchand/mes-commandes`

**Affichage** :
- Liste commandes (cards)
- Pour commande EN_ATTENTE :
  - Badge : 🟠 "En attente de réponse"
  - Produit : Tomate
  - Quantité : 100 kg
  - Prix proposé : 500 FCFA/kg
  - Total : 50 000 FCFA
  - Producteur : Jean Kouassi
  - Expire dans : 22h
  - Bouton : ❌ "Annuler"

**Actions** :

**ACTION CMD2.1** : Attendre réponse Producteur
```
→ Auto-refresh ou WebSocket (futur)
→ Si Producteur accepte : TRANSITION ÉTAPE CMD103
→ Si Producteur refuse : Badge ❌ "Refusée" + raison
→ Si Producteur contre-propose : TRANSITION ÉTAPE CMD102
→ Si timeout 24h : Badge ⏰ "Expirée"
```

---

### **ÉTAPE CMD102 : MARCHAND - NÉGOCIATION EN COURS**
**État commande** : `status = EN_NEGOCIATION`

**Affichage** :
- Badge : 🔄 "Négociation"
- Prix initial : 500 FCFA/kg (barré)
- **Contre-proposition Producteur** : 550 FCFA/kg
- Message : "Stock de qualité supérieure"
- Nouveau total : 55 000 FCFA
- 3 boutons :
  - ✅ **"Accepter 550 FCFA/kg"** (vert)
  - ❌ **"Refuser"** (rouge)
  - 🔄 **"Re-contre-proposer"** (orange, si negotiationCount < 2)

**Actions** :

**ACTION CMD3.1** : Clic **"Accepter 550 FCFA/kg"**
```
→ Appel CommandeContext.accepterContreProposition()
→ Update commande :
   - prixFinal = 550
   - montantTotal = 55 000
   - status: EN_NEGOCIATION → ACCEPTEE
→ Notification Producteur : "Votre prix est accepté !"
→ Synthèse vocale : "Contre-proposition acceptée"
→ TRANSITION ÉTAPE CMD103
```

**ACTION CMD3.2** : Clic **"Refuser"**
```
→ Appel CommandeContext.refuserContreProposition()
→ Update commande :
   - status: EN_NEGOCIATION → ANNULEE
   - cancellationReason: "Contre-proposition refusée"
→ Notification Producteur : "Commande annulée"
→ Synthèse vocale : "Commande annulée"
→ Badge : ❌ "Annulée"
→ RESTE sur ÉTAPE CMD102 (fin de workflow)
```

**ACTION CMD3.3** : Clic **"Re-contre-proposer"**
```
IF negotiationCount >= 2 :
   → Erreur : "Maximum 2 allers-retours atteints"
   → RESTE sur ÉTAPE CMD102

ELSE :
   → Ouverture MODAL : Input nouveau prix
   → Saisie 525 FCFA/kg
   → Appel CommandeContext.reContreProposer(525)
   → Update commande :
      negotiationCount: 1 → 2
      prixNegocie: 525
      expiresAt: +24h (nouveau timeout)
   → Notification Producteur : "Marchand a re-contre-proposé"
   → Badge : 🔄 "En attente réponse Producteur"
   → RESTE sur ÉTAPE CMD102 (boucle)
```

---

### **ÉTAPE CMD103 : MARCHAND - COMMANDE ACCEPTÉE (Paiement requis)**
**État commande** : `status = ACCEPTEE`

**Affichage** :
- Badge : 🟢 "Acceptée - Paiement requis"
- Prix final : 550 FCFA/kg
- Total : 55 000 FCFA
- **Wallet actuel** : 80 000 FCFA (affiché)
- Warning : ⚠️ "Paye pour confirmer la commande"
- Bouton : 💳 **"Payer maintenant"** (vert pulsant)

**Actions** :

**ACTION CMD4.1** : Clic **"Payer maintenant"**
```
IF wallet.balance < montantTotal :
   → Erreur : "Solde wallet insuffisant"
   → Synthèse vocale : "Solde insuffisant. Recharge ton wallet"
   → Apparition bouton "Recharger wallet" → ÉTAPE W101
   → RESTE sur ÉTAPE CMD103

ELSE :
   → Appel CommandeContext.payerCommande()
   → Appel WalletContext.bloquerArgent(commandeId, 55000, producteurId)
   → Update wallet Marchand :
      balance: 80 000 → 25 000 FCFA
      escrowBalance: 0 → 55 000 FCFA
   → Création EscrowPayment :
      status: 'BLOCKED'
      amount: 55 000
   → Update commande :
      status: ACCEPTEE → PAYEE
      paymentStatus: 'PAID'
      paidAt: now
   → Notification Producteur : "💰 Le marchand a payé 55 000 FCFA. L'argent sera crédité après livraison"
   → Synthèse vocale : "Paiement effectué. Argent sécurisé en attente de livraison"
   → TRANSITION ÉTAPE CMD104
```

---

### **ÉTAPE CMD104 : MARCHAND - COMMANDE PAYÉE (Attente livraison)**
**État commande** : `status = PAYEE`

**Affichage** :
- Badge : 🟡 "Payée - En attente de livraison"
- Prix : 550 FCFA/kg
- Total : 55 000 FCFA
- Info : 💰 "Argent sécurisé en escrow. Sera libéré après confirmation de réception"
- Message : "Le producteur prépare votre commande"
- Pas de bouton d'action (attente Producteur)

**Actions** :

**ACTION CMD5.1** : Attendre que Producteur livre
```
→ Lorsque Producteur clique "J'ai livré" : TRANSITION ÉTAPE CMD105
```

---

### **ÉTAPE CMD105 : MARCHAND - LIVRAISON À CONFIRMER**
**État commande** : `status = EN_ATTENTE_CONFIRMATION_MARCHAND`

**Affichage** :
- Badge : 🚚 "Livraison à confirmer"
- Message : "🚚 Le producteur a marqué la commande comme livrée"
- Date livraison : [timestamp]
- Localisation : (si géolocation capturée)
- Warning : ⚠️ "Tu as 48h pour confirmer ou signaler un problème"
- Timer : "Expire dans 46h"
- 2 boutons :
  - ✅ **"J'ai bien reçu"** (vert, principal)
  - ❌ **"Signaler un problème"** (rouge, secondaire)

**Actions** :

**ACTION CMD6.1** : Clic **"J'ai bien reçu"**
```
→ Appel CommandeContext.confirmerReception()
→ Appel WalletContext.libererArgent(escrowId, producteurId)
→ Update commande :
   - status: EN_ATTENTE_CONFIRMATION_MARCHAND → LIVREE
   - deliveryStatus: 'CONFIRMED'
   - paymentStatus: 'RELEASED'
   - buyerConfirmedAt: now
→ Update escrow :
   - status: 'BLOCKED' → 'RELEASED'
→ Notification Producteur : "✅ Livraison confirmée ! Clique sur 'Récupérer l'argent' pour créditer ton wallet"
→ Synthèse vocale : "Réception confirmée. Merci !"
→ Update wallet Marchand :
   - escrowBalance: 55 000 → 0 FCFA (libéré, mais pas encore au Producteur)
→ TRANSITION ÉTAPE CMD106 (commande terminée côté Marchand)
```

**ACTION CMD6.2** : Clic **"Signaler un problème"**
```
→ TODO: Workflow litige (futur)
→ Ouverture modal : Raison + Photos
→ Notification Admin + Producteur
→ Escrow reste bloqué (médiation)
```

**ACTION CMD6.3** : Timeout 48h sans confirmation
```
→ Auto-trigger CommandeContext.verifierTimeouts()
→ Update commande :
   - status: EN_ATTENTE_CONFIRMATION_MARCHAND → ACCEPTEE
   - deliveryStatus: 'NOT_STARTED'
   - cancellationReason: "Timeout confirmation (48h)"
→ Producteur peut re-livrer
→ RETOUR ÉTAPE CMD104
```

---

### **ÉTAPE CMD106 : MARCHAND - COMMANDE TERMINÉE**
**État commande** : `status = LIVREE` (attente récupération Producteur)

**Affichage** :
- Badge : ✅ "Livrée"
- Prix : 550 FCFA/kg
- Total : 55 000 FCFA
- Date livraison : [date]
- Info : ✅ "Commande terminée avec succès"
- Bouton : 📄 "Télécharger facture" (futur)
- Bouton : ⭐ "Laisser un avis" (futur)

**Fin du workflow Marchand**

---

## WORKFLOW PRODUCTEUR (Réception commande)

### **ÉTAPE CMDP100 : PRODUCTEUR - NOUVELLE COMMANDE**
**Route** : `/producteur/commandes` (onglet "En attente")

**Affichage** :
- Notification : "Nouvelle commande de [Marchand]"
- Card commande :
  - Badge : 🟠 "En attente"
  - Marchand : Kouadio Marie
  - Produit : Tomate
  - Quantité : 100 kg
  - Prix proposé : 500 FCFA/kg
  - Total : 50 000 FCFA
  - Expire dans : 23h
  - 3 boutons :
    - ✅ **"Accepter"** (vert)
    - ❌ **"Refuser"** (rouge)
    - 🔄 **"Contre-proposer"** (orange)

**Actions** :

**ACTION CMDP1.1** : Clic **"Accepter"**
```
→ Appel CommandeContext.accepterCommande(commandeId, producteurId)
→ Update commande :
   - status: EN_ATTENTE → ACCEPTEE
→ Notification Marchand : "Commande acceptée ! Paye pour confirmer"
→ Synthèse vocale : "Commande acceptée"
→ Badge : 🟢 "Acceptée - En attente de paiement"
→ TRANSITION ÉTAPE CMDP101
```

**ACTION CMDP1.2** : Clic **"Refuser"**
```
→ Modal : "Raison du refus" (textarea)
→ Appel CommandeContext.refuserCommande(commandeId, producteurId, raison)
→ Update commande :
   - status: EN_ATTENTE → REFUSEE
   - cancellationReason: raison
→ Notification Marchand : "Commande refusée : [raison]"
→ Synthèse vocale : "Commande refusée"
→ Badge : ❌ "Refusée"
→ FIN workflow
```

**ACTION CMDP1.3** : Clic **"Contre-proposer"**
```
→ Modal : Input nouveau prix + textarea message optionnel
→ Saisie 550 FCFA/kg + message "Stock de qualité supérieure"
→ Appel CommandeContext.contreProposerPrix(commandeId, producteurId, 550, message)
→ Update commande :
   - status: EN_ATTENTE → EN_NEGOCIATION
   - prixNegocie: 550
   - negotiationCount: 0 → 1
   - expiresAt: +24h (reset)
→ Notification Marchand : "Contre-proposition : 550 FCFA/kg"
→ Synthèse vocale : "Contre-proposition envoyée"
→ Badge : 🔄 "Négociation - Attente réponse"
→ TRANSITION ÉTAPE CMDP102
```

---

### **ÉTAPE CMDP101 : PRODUCTEUR - COMMANDE PAYÉE**
**État commande** : `status = PAYEE`

**Affichage** :
- Badge : 💰 "Payée - Prête à livrer"
- Montant : 50 000 FCFA (en escrow)
- Info : 💰 "Le marchand a payé. L'argent est sécurisé et sera crédité après livraison confirmée"
- Bouton : 🚚 **"Marquer comme livrée"** (vert principal)

**Actions** :

**ACTION CMDP2.1** : Clic **"Marquer comme livrée"**
```
→ Modal confirmation : "As-tu bien livré cette commande ?"
→ Optionnel : Capture géolocalisation (GPS)
→ Appel CommandeContext.marquerLivree(commandeId, producteurId, location)
→ Update commande :
   - status: PAYEE → EN_ATTENTE_CONFIRMATION_MARCHAND
   - deliveryStatus: 'IN_PROGRESS'
   - producerMarkedDeliveredAt: now
   - expiresAt: +48h
→ Notification Marchand : "🚚 Livraison déclarée. Confirme la réception"
→ Synthèse vocale : "Livraison enregistrée. En attente de confirmation"
→ Badge : 🚚 "Livraison déclarée - Attente confirmation"
→ TRANSITION ÉTAPE CMDP103
```

---

### **ÉTAPE CMDP103 : PRODUCTEUR - ATTENTE CONFIRMATION**
**État commande** : `status = EN_ATTENTE_CONFIRMATION_MARCHAND`

**Affichage** :
- Badge : 🚚 "Livraison déclarée"
- Montant : 50 000 FCFA (en escrow, bientôt disponible)
- Info : "En attente de confirmation du marchand (48h max)"
- Timer : "Confirmation dans 46h"
- Bouton : 🔙 **"Annuler la livraison"** (si erreur)

**Actions** :

**ACTION CMDP3.1** : Attendre confirmation Marchand
```
→ Lorsque Marchand confirme : TRANSITION ÉTAPE CMDP104
```

**ACTION CMDP3.2** : Clic **"Annuler la livraison"** (si erreur)
```
→ Modal : "Pourquoi annuler ?" (textarea obligatoire)
→ Appel CommandeContext.annulerLivraison(commandeId, producteurId, raison)
→ Update commande :
   - status: EN_ATTENTE_CONFIRMATION_MARCHAND → PAYEE
   - deliveryStatus: 'NOT_STARTED'
   - producerMarkedDeliveredAt: null
   - cancellationReason: raison
→ Synthèse vocale : "Livraison annulée"
→ RETOUR ÉTAPE CMDP101 (peut re-livrer)
```

---

### **ÉTAPE CMDP104 : PRODUCTEUR - ARGENT DISPONIBLE**
**État commande** : `status = LIVREE`, `paymentStatus = RELEASED`

**Affichage** :
- Badge : ✅ "Livrée - Paiement disponible"
- Montant : 50 000 FCFA
- Info : ✅ "Le marchand a confirmé la réception ! Ton argent est disponible"
- Bouton : 💰 **"Récupérer l'argent"** (vert pulsant, principal)

**Actions** :

**ACTION CMDP4.1** : Clic **"Récupérer l'argent"**
```
→ Modal confirmation : "Créditer 50 000 FCFA dans ton wallet ?"
→ Appel CommandeContext.recupererPaiement(commandeId, producteurId)
→ Appel WalletContext.recupererArgent(escrowId)
→ Update wallet Producteur :
   - balance: 20 000 → 70 000 FCFA (+50 000)
   - totalReceived: +50 000
→ Suppression escrow (traité)
→ Update commande :
   - status: LIVREE → TERMINEE
   - completedAt: now
→ Synthèse vocale : "50 000 francs CFA crédités dans ton wallet !"
→ Badge : ✅ "Terminée"
→ TRANSITION ÉTAPE CMDP105 (FIN)
```

---

### **ÉTAPE CMDP105 : PRODUCTEUR - COMMANDE TERMINÉE**
**État commande** : `status = TERMINEE`

**Affichage** :
- Badge : ✅ "Terminée"
- Montant : 50 000 FCFA (reçu)
- Date : [date]
- Bouton : ⭐ "Laisser un avis" (futur)

**Fin du workflow Producteur**

---

## RÉSUMÉ DES ÉTATS DE COMMANDE

| État | Acteur actif | Action attendue | Timeout |
|------|--------------|-----------------|---------|
| `EN_ATTENTE` | Producteur | Accepter/Refuser/Contre-proposer | 24h → EXPIREE |
| `EN_NEGOCIATION` | Marchand | Accepter/Refuser/Re-contre-proposer | 24h → EXPIREE |
| `ACCEPTEE` | Marchand | Payer | - |
| `PAYEE` | Producteur | Marquer livrée | - |
| `EN_ATTENTE_CONFIRMATION_MARCHAND` | Marchand | Confirmer réception | 48h → Retour ACCEPTEE |
| `LIVREE` | Producteur | Récupérer argent | - |
| `TERMINEE` | - | Archivée | - |

---

## BLOCAGES MÉTIER WALLET & COMMANDES

| Condition | Blocage | Solution |
|-----------|---------|----------|
| `wallet.balance < montantCommande` | ⛔ Paiement impossible | Recharger wallet (ÉTAPE W101) |
| `escrowBalance > 0` | ℹ️ Argent bloqué (info) | Attendre livraison + confirmation |
| `negotiationCount >= 2` | ⛔ Re-contre-proposition impossible | Accepter ou refuser |
| Commande EXPIREE | ⛔ Aucune action possible | Créer nouvelle commande |
| Timeout 48h confirmation | 🔄 Auto-retour ACCEPTEE | Producteur peut re-livrer |

---

**FIN DU DOCUMENT**

**Prochaine mise à jour** : Intégration des workflows Coopérative et Marketplace UI

**Auteur** : Équipe technique JULABA  
**Date** : Mars 2026
