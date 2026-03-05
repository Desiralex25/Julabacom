# 🚀 MIGRATION TOTALE VERS SUPABASE - PLAN D'EXÉCUTION

## 🎯 OBJECTIF FINAL : 0% LOCAL - 100% SERVEUR

---

## 📊 AUDIT INITIAL - ÉTAT ACTUEL

### **Contexts Identifiés (20)**

| Context | État Actuel | Données Mock | localStorage | Migration Requise |
|---------|-------------|--------------|--------------|-------------------|
| AppContext | ⚠️ Partiellement migré | ❌ MOCK_USERS supprimé | ✅ Supprimé | ✅ OUI |
| UserContext | ⚠️ Partiellement migré | ❌ Supprimé | ✅ Supprimé | ✅ OUI |
| BackOfficeContext | ✅ Migré | ❌ Supprimé | ✅ Supprimé | ✅ FAIT |
| CaisseContext | ❌ LOCAL | ✅ DEFAULT_PRODUCTS | ❌ Utilisé (commenté) | ✅ OUI |
| CommandeContext | ❌ LOCAL | ❌ Supprimé | ✅ Supprimé | ✅ OUI |
| CooperativeContext | ❌ LOCAL | ❌ Supprimé | ✅ Supprimé | ✅ OUI |
| IdentificateurContext | ❌ LOCAL | ❌ Supprimé | ✅ Supprimé | ✅ OUI |
| ProducteurContext | ❌ LOCAL | ✅ MOCK commenté | ✅ Supprimé | ✅ OUI |
| RecolteContext | ❌ LOCAL | ❌ Supprimé | ✅ Supprimé | ✅ OUI |
| StockContext | ❌ LOCAL | ❌ Supprimé | ✅ Supprimé | ✅ OUI |
| WalletContext | ❌ LOCAL | ❌ Supprimé | ✅ Supprimé | ✅ OUI |
| ZoneContext | ❌ LOCAL | ✅ DEFAULT_ZONES | ✅ Supprimé | ✅ OUI |
| AuditContext | ❌ LOCAL | ❌ Supprimé | ✅ Supprimé | ✅ OUI |
| ScoreContext | ❌ LOCAL | ❌ Supprimé | ✅ Supprimé | ✅ OUI |
| NotificationsContext | ❌ LOCAL | ❌ Supprimé | ⚠️ **UTILISÉ** | ✅ OUI |
| TicketsContext | ❌ LOCAL | ❌ Supprimé | ❌ À vérifier | ✅ OUI |
| SupportConfigContext | ❌ LOCAL | ❌ À vérifier | ❌ À vérifier | ✅ OUI |
| InstitutionContext | ❌ LOCAL | ❌ À vérifier | ❌ À vérifier | ✅ OUI |
| InstitutionAccessContext | ❌ LOCAL | ❌ À vérifier | ❌ À vérifier | ✅ OUI |
| ModalContext | ✅ UI ONLY | ❌ N/A | ❌ N/A | ❌ NON |

---

## 🗄️ PHASE 2 : ARCHITECTURE BASE DE DONNÉES SUPABASE

### **Tables à Créer**

#### **1. users_julaba** ✅ EXISTE
```sql
- id
- auth_user_id
- phone
- first_name
- last_name
- role
- region
- commune
- validated
- score
- created_at
- last_login_at
```

#### **2. commandes**
```sql
CREATE TABLE commandes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users_julaba(id),
  acheteur_id UUID REFERENCES users_julaba(id),
  vendeur_id UUID REFERENCES users_julaba(id),
  type TEXT CHECK (type IN ('achat', 'vente')),
  statut TEXT CHECK (statut IN ('en_attente', 'confirmee', 'en_route', 'livree', 'annulee')),
  produit TEXT NOT NULL,
  quantite TEXT NOT NULL,
  prix DECIMAL NOT NULL,
  total DECIMAL NOT NULL,
  mode_paiement TEXT,
  date_creation TIMESTAMPTZ DEFAULT NOW(),
  date_livraison TIMESTAMPTZ,
  adresse_livraison TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### **3. recoltes**
```sql
CREATE TABLE recoltes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  producteur_id UUID REFERENCES users_julaba(id),
  produit TEXT NOT NULL,
  quantite DECIMAL NOT NULL,
  unite TEXT NOT NULL,
  qualite TEXT CHECK (qualite IN ('standard', 'premium', 'bio')),
  prix_unitaire DECIMAL NOT NULL,
  statut TEXT CHECK (statut IN ('declaree', 'validee', 'vendue')),
  date_recolte DATE NOT NULL,
  parcelle TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### **4. stocks**
```sql
CREATE TABLE stocks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users_julaba(id),
  produit TEXT NOT NULL,
  quantite DECIMAL NOT NULL,
  unite TEXT NOT NULL,
  prix_achat DECIMAL,
  derniere_modification TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### **5. wallets**
```sql
CREATE TABLE wallets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users_julaba(id) UNIQUE,
  solde DECIMAL DEFAULT 0,
  solde_bloque DECIMAL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### **6. wallet_transactions**
```sql
CREATE TABLE wallet_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_id UUID REFERENCES wallets(id),
  user_id UUID REFERENCES users_julaba(id),
  type TEXT CHECK (type IN ('credit', 'debit', 'blocage', 'deblocage', 'remboursement')),
  montant DECIMAL NOT NULL,
  description TEXT,
  reference TEXT,
  statut TEXT CHECK (statut IN ('pending', 'completed', 'failed', 'cancelled')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### **7. escrow_payments**
```sql
CREATE TABLE escrow_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  commande_id UUID REFERENCES commandes(id),
  acheteur_id UUID REFERENCES users_julaba(id),
  vendeur_id UUID REFERENCES users_julaba(id),
  montant DECIMAL NOT NULL,
  statut TEXT CHECK (statut IN ('bloque', 'libere', 'rembourse', 'annule')),
  date_creation TIMESTAMPTZ DEFAULT NOW(),
  date_liberation TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### **8. caisse_transactions**
```sql
CREATE TABLE caisse_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  marchand_id UUID REFERENCES users_julaba(id),
  type TEXT CHECK (type IN ('vente', 'depense', 'approvisionnement')),
  montant DECIMAL NOT NULL,
  produits JSONB,
  mode_paiement TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### **9. zones**
```sql
CREATE TABLE zones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nom TEXT NOT NULL,
  type TEXT CHECK (type IN ('region', 'departement', 'commune', 'village')),
  parent_id UUID REFERENCES zones(id),
  gestionnaire_id UUID REFERENCES users_julaba(id),
  actif BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### **10. identifications**
```sql
CREATE TABLE identifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  identificateur_id UUID REFERENCES users_julaba(id),
  acteur_id UUID REFERENCES users_julaba(id),
  type_acteur TEXT CHECK (type_acteur IN ('marchand', 'producteur', 'cooperative')),
  statut TEXT CHECK (statut IN ('en_attente', 'validee', 'rejetee')),
  documents JSONB,
  zone_id UUID REFERENCES zones(id),
  commission DECIMAL,
  commission_payee BOOLEAN DEFAULT FALSE,
  date_identification DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### **11. commissions**
```sql
CREATE TABLE commissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  identificateur_id UUID REFERENCES users_julaba(id),
  identification_id UUID REFERENCES identifications(id),
  montant DECIMAL NOT NULL,
  statut TEXT CHECK (statut IN ('en_attente', 'validee', 'payee')),
  periode TEXT,
  date_paiement DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### **12. cooperatives**
```sql
CREATE TABLE cooperatives (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users_julaba(id) UNIQUE,
  nom TEXT NOT NULL,
  president_id UUID REFERENCES users_julaba(id),
  tresorier_id UUID REFERENCES users_julaba(id),
  secretaire_id UUID REFERENCES users_julaba(id),
  solde_tresorerie DECIMAL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### **13. cooperative_membres**
```sql
CREATE TABLE cooperative_membres (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cooperative_id UUID REFERENCES cooperatives(id),
  membre_id UUID REFERENCES users_julaba(id),
  role TEXT CHECK (role IN ('president', 'tresorier', 'secretaire', 'membre')),
  date_adhesion DATE NOT NULL,
  cotisation_payee BOOLEAN DEFAULT FALSE,
  actif BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### **14. cooperative_tresorerie**
```sql
CREATE TABLE cooperative_tresorerie (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cooperative_id UUID REFERENCES cooperatives(id),
  type TEXT CHECK (type IN ('cotisation', 'vente', 'achat', 'subvention', 'depense', 'retrait')),
  montant DECIMAL NOT NULL,
  membre_id UUID REFERENCES users_julaba(id),
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### **15. notifications**
```sql
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users_julaba(id),
  role TEXT,
  type TEXT NOT NULL,
  titre TEXT NOT NULL,
  message TEXT NOT NULL,
  priority TEXT CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  is_read BOOLEAN DEFAULT FALSE,
  category TEXT,
  icon TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### **16. audit_logs**
```sql
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users_julaba(id),
  role TEXT,
  action TEXT NOT NULL,
  description TEXT,
  severity TEXT CHECK (severity IN ('info', 'warning', 'critical')),
  entity_type TEXT,
  entity_id UUID,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### **17. ia_logs**
```sql
CREATE TABLE ia_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users_julaba(id),
  role TEXT,
  action_requested TEXT NOT NULL,
  action_executed TEXT,
  confirmation_required BOOLEAN DEFAULT FALSE,
  status TEXT CHECK (status IN ('pending', 'executed', 'cancelled', 'failed')),
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### **18. tickets_support**
```sql
CREATE TABLE tickets_support (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users_julaba(id),
  titre TEXT NOT NULL,
  description TEXT NOT NULL,
  categorie TEXT CHECK (categorie IN ('technique', 'paiement', 'livraison', 'compte', 'autre')),
  priorite TEXT CHECK (priorite IN ('basse', 'moyenne', 'haute', 'critique')),
  statut TEXT CHECK (statut IN ('ouvert', 'en_cours', 'resolu', 'ferme')),
  assigne_a UUID REFERENCES users_julaba(id),
  reponses JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### **19. missions**
```sql
CREATE TABLE missions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  identificateur_id UUID REFERENCES users_julaba(id),
  titre TEXT NOT NULL,
  description TEXT,
  zone_id UUID REFERENCES zones(id),
  objectif INTEGER,
  progres INTEGER DEFAULT 0,
  statut TEXT CHECK (statut IN ('en_cours', 'terminee', 'annulee')),
  date_debut DATE,
  date_fin DATE,
  recompense DECIMAL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### **20. academy_progress**
```sql
CREATE TABLE academy_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users_julaba(id),
  module_id TEXT NOT NULL,
  progres INTEGER DEFAULT 0,
  complete BOOLEAN DEFAULT FALSE,
  score INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, module_id)
);
```

#### **21. scores**
```sql
CREATE TABLE scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users_julaba(id) UNIQUE,
  score_total INTEGER DEFAULT 0,
  score_fiabilite INTEGER DEFAULT 0,
  score_qualite INTEGER DEFAULT 0,
  score_ponctualite INTEGER DEFAULT 0,
  nb_transactions INTEGER DEFAULT 0,
  nb_avis INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 🔐 PHASE 6 : ROW LEVEL SECURITY (RLS)

### **Politique RLS par Profil**

#### **Marchand**
```sql
-- Voir uniquement ses commandes
CREATE POLICY "Marchands voient leurs commandes"
ON commandes FOR SELECT
USING (auth.uid() = (SELECT auth_user_id FROM users_julaba WHERE id = user_id));

-- Voir uniquement son stock
CREATE POLICY "Marchands voient leur stock"
ON stocks FOR SELECT
USING (auth.uid() = (SELECT auth_user_id FROM users_julaba WHERE id = user_id));

-- Voir uniquement ses transactions caisse
CREATE POLICY "Marchands voient leurs transactions"
ON caisse_transactions FOR SELECT
USING (auth.uid() = (SELECT auth_user_id FROM users_julaba WHERE id = marchand_id));
```

#### **Producteur**
```sql
-- Voir uniquement ses récoltes
CREATE POLICY "Producteurs voient leurs récoltes"
ON recoltes FOR SELECT
USING (auth.uid() = (SELECT auth_user_id FROM users_julaba WHERE id = producteur_id));

-- Voir uniquement ses commandes
CREATE POLICY "Producteurs voient leurs commandes"
ON commandes FOR SELECT
USING (auth.uid() = (SELECT auth_user_id FROM users_julaba WHERE id = user_id));
```

#### **Identificateur**
```sql
-- Voir uniquement ses identifications
CREATE POLICY "Identificateurs voient leurs identifications"
ON identifications FOR SELECT
USING (auth.uid() = (SELECT auth_user_id FROM users_julaba WHERE id = identificateur_id));

-- Voir uniquement ses commissions
CREATE POLICY "Identificateurs voient leurs commissions"
ON commissions FOR SELECT
USING (auth.uid() = (SELECT auth_user_id FROM users_julaba WHERE id = identificateur_id));

-- Voir uniquement leurs missions
CREATE POLICY "Identificateurs voient leurs missions"
ON missions FOR SELECT
USING (auth.uid() = (SELECT auth_user_id FROM users_julaba WHERE id = identificateur_id));
```

#### **Coopérative**
```sql
-- Voir uniquement les membres de sa coopérative
CREATE POLICY "Cooperatives voient leurs membres"
ON cooperative_membres FOR SELECT
USING (
  cooperative_id IN (
    SELECT id FROM cooperatives WHERE user_id IN (
      SELECT id FROM users_julaba WHERE auth_user_id = auth.uid()
    )
  )
);

-- Voir uniquement la trésorerie de sa coopérative
CREATE POLICY "Cooperatives voient leur trésorerie"
ON cooperative_tresorerie FOR SELECT
USING (
  cooperative_id IN (
    SELECT id FROM cooperatives WHERE user_id IN (
      SELECT id FROM users_julaba WHERE auth_user_id = auth.uid()
    )
  )
);
```

#### **BackOffice**
```sql
-- Accès global pour super_admin
CREATE POLICY "Super Admin accès total"
ON commandes FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM users_julaba 
    WHERE auth_user_id = auth.uid() AND role = 'super_admin'
  )
);

-- Accès régional pour gestionnaire_zone
CREATE POLICY "Gestionnaire Zone accès régional"
ON commandes FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM users_julaba u
    WHERE u.auth_user_id = auth.uid() 
    AND u.role = 'gestionnaire_zone'
    AND u.region = (SELECT region FROM users_julaba WHERE id = user_id)
  )
);
```

---

## 📡 PHASE 3 : ROUTES BACKEND API

### **Fichier : `/supabase/functions/server/api.ts`**

Routes à créer pour chaque entité :

#### **Commandes**
- `GET /api/commandes` - Liste des commandes de l'utilisateur
- `POST /api/commandes` - Créer une commande
- `PATCH /api/commandes/:id` - Modifier une commande
- `DELETE /api/commandes/:id` - Annuler une commande

#### **Récoltes**
- `GET /api/recoltes` - Liste des récoltes
- `POST /api/recoltes` - Déclarer une récolte
- `PATCH /api/recoltes/:id` - Modifier une récolte
- `DELETE /api/recoltes/:id` - Supprimer une récolte

#### **Stocks**
- `GET /api/stocks` - Liste du stock
- `POST /api/stocks` - Ajouter au stock
- `PATCH /api/stocks/:id` - Modifier le stock
- `DELETE /api/stocks/:id` - Supprimer du stock

#### **Wallets**
- `GET /api/wallet` - Voir son wallet
- `POST /api/wallet/credit` - Créditer le wallet
- `POST /api/wallet/debit` - Débiter le wallet
- `GET /api/wallet/transactions` - Historique transactions

#### **Caisse**
- `GET /api/caisse/transactions` - Transactions caisse
- `POST /api/caisse/vente` - Enregistrer une vente
- `POST /api/caisse/depense` - Enregistrer une dépense

#### **Zones**
- `GET /api/zones` - Liste des zones
- `GET /api/zones/:id` - Détails d'une zone

#### **Identifications**
- `GET /api/identifications` - Mes identifications
- `POST /api/identifications` - Créer une identification
- `PATCH /api/identifications/:id` - Modifier une identification

#### **Commissions**
- `GET /api/commissions` - Mes commissions
- `GET /api/commissions/stats` - Stats commissions

#### **Coopératives**
- `GET /api/cooperative` - Ma coopérative
- `GET /api/cooperative/membres` - Membres de la coopérative
- `GET /api/cooperative/tresorerie` - Trésorerie
- `POST /api/cooperative/tresorerie` - Ajouter transaction trésorerie

#### **Notifications**
- `GET /api/notifications` - Mes notifications
- `PATCH /api/notifications/:id/read` - Marquer comme lu
- `DELETE /api/notifications/:id` - Supprimer notification

#### **Audit**
- `GET /api/audit` - Logs d'audit (BO uniquement)
- `POST /api/audit` - Créer un log

#### **Tickets Support**
- `GET /api/tickets` - Mes tickets
- `POST /api/tickets` - Créer un ticket
- `PATCH /api/tickets/:id` - Répondre à un ticket

#### **Missions**
- `GET /api/missions` - Mes missions
- `PATCH /api/missions/:id/progres` - Mettre à jour le progrès

#### **Academy**
- `GET /api/academy/progress` - Mon progrès
- `PATCH /api/academy/:moduleId` - Mettre à jour le progrès

#### **Scores**
- `GET /api/scores/:userId` - Voir le score
- `PATCH /api/scores/:userId` - Mettre à jour le score

---

## 🔄 PHASE 4 : MIGRATION DES CONTEXTS

### **Ordre de Migration**

1. **ZoneContext** (Pas de dépendances)
2. **UserContext** (Base)
3. **WalletContext** (Dépend de UserContext)
4. **ScoreContext** (Dépend de UserContext)
5. **NotificationsContext** (Dépend de UserContext)
6. **AuditContext** (Dépend de UserContext)
7. **StockContext** (Dépend de UserContext)
8. **RecolteContext** (Dépend de UserContext)
9. **CommandeContext** (Dépend de UserContext + WalletContext)
10. **CaisseContext** (Dépend de UserContext + StockContext)
11. **ProducteurContext** (Dépend de RecolteContext + CommandeContext)
12. **CooperativeContext** (Dépend de UserContext)
13. **IdentificateurContext** (Dépend de UserContext + ZoneContext)
14. **InstitutionContext** (Dépend de UserContext)
15. **TicketsContext** (Dépend de UserContext)
16. **SupportConfigContext** (Dépend de BackOfficeContext)

---

## ✅ CHECKLIST DE MIGRATION PAR CONTEXT

### **Template de Migration**

```typescript
// ❌ AVANT
const [data, setData] = useState<Type[]>([]);

// ✅ APRÈS
const [data, setData] = useState<Type[]>([]);
const [loading, setLoading] = useState(true);
const [error, setError] = useState<string | null>(null);

useEffect(() => {
  if (!userId) return;
  
  async function loadData() {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_URL}/api/data`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) throw new Error('Erreur chargement');
      
      const result = await response.json();
      setData(result.data);
    } catch (err) {
      setError(err.message);
      console.error('Erreur:', err);
    } finally {
      setLoading(false);
    }
  }
  
  loadData();
}, [userId, accessToken]);
```

---

## 📋 RAPPORT DE MIGRATION (À GÉNÉRER)

### **1. Tables Supabase Créées**
- [ ] users_julaba (existante)
- [ ] commandes
- [ ] recoltes
- [ ] stocks
- [ ] wallets
- [ ] wallet_transactions
- [ ] escrow_payments
- [ ] caisse_transactions
- [ ] zones
- [ ] identifications
- [ ] commissions
- [ ] cooperatives
- [ ] cooperative_membres
- [ ] cooperative_tresorerie
- [ ] notifications
- [ ] audit_logs
- [ ] ia_logs
- [ ] tickets_support
- [ ] missions
- [ ] academy_progress
- [ ] scores

### **2. Contexts Migrés**
- [ ] ZoneContext
- [ ] UserContext
- [ ] WalletContext
- [ ] ScoreContext
- [ ] NotificationsContext
- [ ] AuditContext
- [ ] StockContext
- [ ] RecolteContext
- [ ] CommandeContext
- [ ] CaisseContext
- [ ] ProducteurContext
- [ ] CooperativeContext
- [ ] IdentificateurContext
- [ ] InstitutionContext
- [ ] TicketsContext
- [ ] SupportConfigContext

### **3. Routes API Créées**
- [ ] /api/commandes (GET, POST, PATCH, DELETE)
- [ ] /api/recoltes (GET, POST, PATCH, DELETE)
- [ ] /api/stocks (GET, POST, PATCH, DELETE)
- [ ] /api/wallet (GET, POST credit/debit)
- [ ] /api/caisse (GET, POST vente/depense)
- [ ] /api/zones (GET)
- [ ] /api/identifications (GET, POST, PATCH)
- [ ] /api/commissions (GET)
- [ ] /api/cooperative (GET membres, tresorerie, POST)
- [ ] /api/notifications (GET, PATCH, DELETE)
- [ ] /api/audit (GET, POST)
- [ ] /api/tickets (GET, POST, PATCH)
- [ ] /api/missions (GET, PATCH)
- [ ] /api/academy (GET, PATCH)
- [ ] /api/scores (GET, PATCH)

### **4. RLS Activé**
- [ ] Politiques RLS pour Marchand
- [ ] Politiques RLS pour Producteur
- [ ] Politiques RLS pour Identificateur
- [ ] Politiques RLS pour Coopérative
- [ ] Politiques RLS pour BackOffice

### **5. localStorage Nettoyé**
- [x] MOCK_USERS supprimé
- [x] MOCK_BO_USERS supprimé
- [ ] MOCK_STOCK supprimé (commenté)
- [ ] DEFAULT_PRODUCTS migré
- [ ] DEFAULT_ZONES migré
- [ ] Notifications localStorage migré

### **6. Vérifications Finales**
- [ ] Aucune donnée métier dans localStorage
- [ ] Tous les contexts chargent depuis Supabase
- [ ] Toutes les actions écrivent dans Supabase
- [ ] RLS testé pour chaque profil
- [ ] Gestion d'erreurs implémentée
- [ ] Loading states implémentés

---

**Score de Conformité Cible : 100% Serveur**

**Date de début :** Mars 2026  
**Durée estimée :** 4-6 heures de développement
