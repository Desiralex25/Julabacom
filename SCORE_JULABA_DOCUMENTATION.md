# 📊 Score JULABA - Documentation Complète

## 🎯 Qu'est-ce que le Score JULABA ?

Le **Score JULABA** (aussi appelé **Score de Crédit**) est un **indicateur de confiance et de fiabilité** attribué à chaque acteur de la plateforme JULABA. Il mesure la performance, l'engagement et la crédibilité de l'utilisateur dans l'écosystème vivrier ivoirien.

---

## 📐 Calcul du Score

### 📍 Localisation dans le Code

**Fichier principal** : `/src/app/contexts/UserContext.tsx` (lignes 113-114)

```typescript
scoreCredit: userData.score * 10, // Convert score to credit score
niveauMembre: userData.score >= 90 ? 'Platinum' : 
              userData.score >= 80 ? 'Gold' : 
              userData.score >= 70 ? 'Silver' : 'Bronze',
```

### 🔢 Formule Actuelle

```
Score JULABA = score_utilisateur × 10
```

**Exemple** :
- Score utilisateur = 78.5
- Score JULABA = 78.5 × 10 = **785 points**

---

## 🏆 Niveaux de Membre

Le score JULABA détermine automatiquement le **niveau de membre** de l'utilisateur :

| Score JULABA | Niveau | Badge | Signification |
|--------------|--------|-------|---------------|
| **900 - 1000** | 🏆 **Platinum** | 🥇 | Top Performer - Confiance maximale |
| **800 - 899** | 🥇 **Gold** | 🥈 | Excellent - Très fiable |
| **700 - 799** | 🥈 **Silver** | 🥉 | Très bien - Fiable |
| **0 - 699** | 🥉 **Bronze** | - | Bon - En progression |

### Code de Calcul du Niveau

```typescript
if (score >= 90) return 'Platinum';
if (score >= 80) return 'Gold';
if (score >= 70) return 'Silver';
return 'Bronze';
```

---

## 📊 Critères d'Évaluation (Proposés)

> ⚠️ **Note** : Actuellement, le score est une valeur fixe. Voici les critères recommandés pour un calcul dynamique.

### 1. **Activité Transactionnelle (40%)**
- Nombre de transactions effectuées
- Volume des transactions
- Régularité des activités
- Diversité des opérations

**Calcul** :
```typescript
const scoreActivite = (
  (nombreTransactions / 1000) * 15 +
  (volumeTransactions / 100000000) * 15 +
  regularite * 10
);
```

### 2. **Fiabilité et Ponctualité (30%)**
- Taux de transactions réussies
- Respect des délais de livraison (pour producteurs)
- Paiements à temps
- Absence de litiges

**Calcul** :
```typescript
const scoreFiabilite = (
  tauxReussite * 15 +
  respectDelais * 10 +
  (1 - tauxLitiges) * 5
);
```

### 3. **Ancienneté et Engagement (20%)**
- Durée d'inscription sur la plateforme
- Fréquence de connexion
- Utilisation des fonctionnalités
- Participation aux formations

**Calcul** :
```typescript
const joursInscription = (Date.now() - dateInscription) / (1000 * 60 * 60 * 24);
const scoreAnciennete = (
  Math.min(joursInscription / 365, 1) * 10 +
  frequenceConnexion * 5 +
  utilisationFonctionnalites * 5
);
```

### 4. **Vérification et Conformité (10%)**
- Documents validés (CNI, CMU, RSTI)
- Informations complètes
- Statut de vérification
- Respect des règles

**Calcul** :
```typescript
const scoreConformite = (
  documentsValides * 5 +
  informationsCompletes * 3 +
  (statut === 'Vérifié' ? 2 : 0)
);
```

### 🔢 Formule Complète Recommandée

```typescript
scoreTotal = (
  scoreActivite +        // 40 points max
  scoreFiabilite +       // 30 points max
  scoreAnciennete +      // 20 points max
  scoreConformite        // 10 points max
) // Total : 100 points max

scoreCredit = scoreTotal * 10; // Score sur 1000
```

---

## 💾 Stockage et Affichage

### Structure de Données

**Interface UserData** (`/src/app/contexts/UserContext.tsx`) :

```typescript
interface UserData {
  // ... autres champs
  scoreCredit: number;      // Score sur 1000
  niveauMembre: string;     // Platinum, Gold, Silver, Bronze
}
```

### Valeurs par Défaut

**Utilisateur Marchand par défaut** :
```typescript
scoreCredit: 785,
niveauMembre: 'Gold',
```

### Exemples dans la Base de Données Mock

**Fichier** : `/src/app/components/institution/Acteurs.tsx`

```typescript
const acteurs = [
  {
    nom: 'KONÉ',
    prenoms: 'Fatou',
    scoreCredit: 845,  // Gold
    totalTransactions: 342,
  },
  {
    nom: 'TRAORÉ',
    prenoms: 'Ibrahim',
    scoreCredit: 920,  // Platinum
    totalTransactions: 856,
  },
  {
    nom: 'OUATTARA',
    prenoms: 'Aya',
    scoreCredit: 695,  // Bronze
    totalTransactions: 245,
  },
];
```

---

## 🎨 Affichage du Score

### 1. **Page Profil**

Le score est affiché de manière proéminente avec :
- ✅ Animation de compteur
- ✅ Couleur du rôle
- ✅ Badge de niveau
- ✅ Effet visuel

**Exemple** (Marchand) :
```tsx
<Counter value={user.scoreCredit} duration={1500} />
// Affiche : 785 (animé)
```

### 2. **Modal Score**

Modal dédié pour voir les détails du score :

**Fichier** : `/src/app/components/marchand/MarchandModals.tsx` (ligne 848)

```tsx
<ScoreModal>
  <h2>Ton Score JULABA</h2>
  <p>Détails de ton score de crédit.</p>
  <Counter value={user.scoreCredit} />
  <p>Niveau : {user.niveauMembre}</p>
</ScoreModal>
```

### 3. **Carte Professionnelle**

Le score apparaît sur le **verso de la carte professionnelle** avec :
- QR Code
- Score animé
- Badge de niveau
- Couleur du rôle

### 4. **Liste des Acteurs (Institution)**

**Fichier** : `/src/app/components/institution/Acteurs.tsx` (ligne 600)

```tsx
<div>
  <p>Score</p>
  <p>{acteur.scoreCredit}</p>
</div>
```

---

## 🔊 Interaction Vocale

### Commande Tantie Sagesse

**Fichier** : `/src/app/components/assistant/TantieSagesse.tsx` (ligne 155)

```typescript
case 'show_score':
  if (user) {
    speak(`Ton score crédit est de ${user.scoreCredit} points. Niveau ${user.niveauMembre}.`);
  }
  break;
```

**Exemple de dialogue** :
```
Utilisateur : "Tantie, quel est mon score ?"
Tantie : "Ton score crédit est de 785 points. Niveau Gold."
```

---

## 📈 Utilisation du Score dans la Plateforme

### 1. **Accès aux Fonctionnalités**

Le score peut déterminer l'accès à certaines fonctionnalités :

```typescript
// Exemple : Accès au crédit
const peutDemanderCredit = user.scoreCredit >= 700;

// Exemple : Limite de transaction
const limiteTransaction = user.scoreCredit >= 800 ? 10000000 : 5000000;
```

### 2. **Visibilité sur le Marché Virtuel**

Les acteurs avec un score élevé peuvent bénéficier de :
- ✅ Meilleure visibilité
- ✅ Badge de confiance
- ✅ Priorité dans les recommandations

### 3. **Conditions de Crédit**

```typescript
const tauxInteret = user.scoreCredit >= 900 ? 0.05 :  // 5% (Platinum)
                    user.scoreCredit >= 800 ? 0.08 :  // 8% (Gold)
                    user.scoreCredit >= 700 ? 0.12 :  // 12% (Silver)
                                              0.18;   // 18% (Bronze)
```

### 4. **Tableau de Bord Institution**

**Fichier** : `/src/app/components/institution/Dashboard.tsx` (ligne 105)

Affiche le **score moyen** de tous les acteurs :

```tsx
<Card>
  <h3>78/100</h3>
  <p>Score moyen</p>
  <p>+5pts ce mois</p>
</Card>
```

---

## 🔄 Mise à Jour du Score

### Quand le Score Change-t-il ?

**Actuellement** : Le score est **statique** et défini à l'inscription.

**Recommandé** : Le score devrait être **recalculé dynamiquement** après :

1. ✅ Chaque transaction réussie
2. ✅ Chaque validation de document
3. ✅ Chaque connexion (pour la régularité)
4. ✅ Chaque fin de mois (bilan)

### Fonction de Recalcul Proposée

```typescript
// /src/app/utils/scoreCalculator.ts

export function calculateScore(user: UserData, transactions: Transaction[]): number {
  // 1. Score Activité (40 points)
  const scoreActivite = calculateActivityScore(transactions);
  
  // 2. Score Fiabilité (30 points)
  const scoreFiabilite = calculateReliabilityScore(transactions);
  
  // 3. Score Ancienneté (20 points)
  const scoreAnciennete = calculateSeniorityScore(user.dateInscription);
  
  // 4. Score Conformité (10 points)
  const scoreConformite = calculateComplianceScore(user);
  
  // Total sur 100
  const scoreTotal = scoreActivite + scoreFiabilite + scoreAnciennete + scoreConformite;
  
  // Convertir sur 1000
  return Math.round(scoreTotal * 10);
}

export function updateUserScore(userId: string): Promise<void> {
  const user = getUserData(userId);
  const transactions = getUserTransactions(userId);
  
  const newScore = calculateScore(user, transactions);
  const newLevel = calculateLevel(newScore);
  
  return updateUser(userId, {
    scoreCredit: newScore,
    niveauMembre: newLevel,
  });
}
```

---

## 🎯 Recommandations d'Amélioration

### 1. **Score Dynamique** ⭐⭐⭐

Implémenter un système de calcul automatique basé sur :
- Activité réelle de l'utilisateur
- Performance transactionnelle
- Conformité réglementaire

### 2. **Historique du Score** ⭐⭐

Enregistrer l'évolution du score dans le temps :

```typescript
interface ScoreHistory {
  date: string;
  score: number;
  niveau: string;
  raison: string; // "Transaction réussie", "Document validé", etc.
}
```

### 3. **Notifications de Score** ⭐⭐

Notifier l'utilisateur quand :
- ✅ Son score augmente de 50+ points
- ✅ Il change de niveau
- ✅ Son score baisse (avec conseils)

### 4. **Détails du Score** ⭐⭐⭐

Afficher une **décomposition du score** :

```tsx
<ScoreBreakdown>
  <ScoreItem label="Activité" value={40} max={40} />
  <ScoreItem label="Fiabilité" value={25} max={30} />
  <ScoreItem label="Ancienneté" value={15} max={20} />
  <ScoreItem label="Conformité" value={8} max={10} />
</ScoreBreakdown>
```

### 5. **Conseils d'Amélioration** ⭐

Suggérer des actions pour améliorer le score :

```tsx
<ImprovementTips>
  <Tip icon="📊">Effectue 10 transactions de plus ce mois pour gagner +15 pts</Tip>
  <Tip icon="📄">Complète tes documents pour gagner +20 pts</Tip>
  <Tip icon="⏱️">Connecte-toi régulièrement pour gagner +10 pts</Tip>
</ImprovementTips>
```

---

## 📊 Exemples de Scores par Profil

### Marchand
```typescript
scoreCredit: 785,
niveauMembre: 'Gold',
// Basé sur : Activité commerciale régulière + documents validés
```

### Producteur
```typescript
scoreCredit: 880,
niveauMembre: 'Gold',
// Basé sur : Livraisons ponctuelles + qualité des produits
```

### Coopérative
```typescript
scoreCredit: 920,
niveauMembre: 'Platinum',
// Basé sur : Volume de transactions + nombre de membres + impact social
```

### Institution
```typescript
scoreCredit: 950,
niveauMembre: 'Platinum',
// Basé sur : Nombre d'acteurs supervisés + actions menées
```

### Identificateur
```typescript
scoreCredit: 734,
niveauMembre: 'Silver',
// Basé sur : Nombre d'identifications + taux de validation
```

---

## 🔧 Implémentation Technique

### Créer un Service de Score

```typescript
// /src/app/services/ScoreService.ts

export class ScoreService {
  
  // Calculer le score
  static async calculateScore(userId: string): Promise<number> {
    const user = await getUserById(userId);
    const transactions = await getTransactionsByUser(userId);
    
    return this.computeScore(user, transactions);
  }
  
  // Mettre à jour le score
  static async updateScore(userId: string): Promise<void> {
    const newScore = await this.calculateScore(userId);
    await updateUserScore(userId, newScore);
    
    // Vérifier si le niveau a changé
    await this.checkLevelChange(userId, newScore);
  }
  
  // Notifier changement de niveau
  static async checkLevelChange(userId: string, newScore: number): Promise<void> {
    const user = await getUserById(userId);
    const oldLevel = user.niveauMembre;
    const newLevel = this.calculateLevel(newScore);
    
    if (oldLevel !== newLevel) {
      await this.sendLevelChangeNotification(userId, oldLevel, newLevel);
    }
  }
}
```

### Intégrer dans les Transactions

```typescript
// Après chaque transaction
const transaction = await createTransaction(data);

// Mettre à jour le score
await ScoreService.updateScore(transaction.userId);
```

---

## 📖 Résumé

### ✅ État Actuel
- Score statique défini à l'inscription
- Formule simple : `score × 10`
- 4 niveaux : Bronze, Silver, Gold, Platinum
- Affiché sur profil, carte professionnelle, dashboard

### 🚀 Recommandations
- Implémenter calcul dynamique
- Ajouter historique du score
- Créer décomposition détaillée
- Notifier les changements
- Proposer conseils d'amélioration

### 🎯 Impact Métier
- **Confiance** : Les utilisateurs avec un score élevé inspirent confiance
- **Accès** : Le score détermine l'accès à certaines fonctionnalités
- **Crédit** : Conditions de crédit basées sur le score
- **Visibilité** : Meilleur positionnement sur le marché virtuel

---

**Date de création** : Février 2026  
**Version** : 1.0.0  
**Statut** : 📝 Documentation - Implémentation recommandée
