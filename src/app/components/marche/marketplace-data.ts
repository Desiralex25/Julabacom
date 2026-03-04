// ═══════════════════════════════════════════════════════════════════
//  JÙLABA — Store de données partagé entre Producteur / Coopérative / Marchand
//  Source unique de vérité (mock) — sera remplacé par Supabase
// ═══════════════════════════════════════════════════════════════════

export type QualiteType = 'A' | 'B' | 'C';

export type StatutCommande =
  | 'en_attente'
  | 'acceptee'
  | 'en_negociation'
  | 'refusee'
  | 'livree'
  | 'annulee';

// ─── Types partagés ───────────────────────────────────────────────

export interface ProduitMarche {
  id: string;
  produit: string;
  categorie: string;
  quantite: number;
  unite: string;
  prixUnitaire: number;
  qualite: QualiteType;
  /** 'producteur' = exposé directement par un producteur
   *  'cooperative' = publié par la coop (après achat + marge) */
  vendeurType: 'producteur' | 'cooperative';
  vendeurNom: string;
  vendeurId: string;
  village: string;
  region: string;
  telephone: string;
  scoreVendeur: number;
  datePublication: string;
  image?: string;
  // Pour les produits re-publiés par la coop
  prixOrigine?: number;
  vendeurOrigineNom?: string;
}

export interface CommandeMarche {
  id: string;
  /** Qui achète */
  acheteurType: 'cooperative' | 'marchand';
  acheteurNom: string;
  /** Qui vend */
  vendeurType: 'producteur' | 'cooperative';
  vendeurId: string;
  vendeurNom: string;
  produit: string;
  quantite: number;
  unite: string;
  prixUnitaire: number;
  montantTotal: number;
  statut: StatutCommande;
  dateCreation: string;
  dateLivraison: string;
  /** Message de négociation éventuel */
  messageNegociation?: string;
  prixNegocie?: number;
}

export interface NotifMarche {
  id: string;
  /** À qui est destinée la notif */
  destinataireType: 'producteur' | 'cooperative' | 'marchand';
  commandeId: string;
  produit: string;
  acheteurNom: string;
  quantite: number;
  unite: string;
  montantTotal: number;
  statut: StatutCommande;
  dateCreation: string;
  lu: boolean;
}

// ─── Produits exposés par les Producteurs ─────────────────────────
// Visibles par : Coopérative (VUE 01 Achats) + Marchand (Tab 2)

export const PRODUITS_PRODUCTEURS: ProduitMarche[] = [
  {
    id: 'pp1',
    produit: 'Riz local',
    categorie: 'Céréales',
    quantite: 1200,
    unite: 'kg',
    prixUnitaire: 620,
    qualite: 'A',
    vendeurType: 'producteur',
    vendeurNom: 'Kouassi Jean-Baptiste',
    vendeurId: 'PROD-001',
    village: 'Tiébissou',
    region: 'Bélier',
    telephone: '+225 07 01 23 45',
    scoreVendeur: 88,
    datePublication: '2026-03-01',
    image: 'https://images.unsplash.com/photo-1763347120796-f811f8d8337a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsb2NhbCUyMHJpY2UlMjBncmFpbnMlMjB3aGl0ZSUyMGFmcmljYW58ZW58MXx8fHwxNzcyNTcyMTgzfDA&ixlib=rb-4.1.0&q=80&w=400',
  },
  {
    id: 'pp2',
    produit: 'Ignames fraîches',
    categorie: 'Tubercules',
    quantite: 850,
    unite: 'kg',
    prixUnitaire: 380,
    qualite: 'A',
    vendeurType: 'producteur',
    vendeurNom: 'Traoré Aminata',
    vendeurId: 'PROD-002',
    village: 'Katiola',
    region: 'Hambol',
    telephone: '+225 05 34 56 78',
    scoreVendeur: 74,
    datePublication: '2026-03-02',
    image: 'https://images.unsplash.com/photo-1757332051150-a5b3c4510af8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmcmVzaCUyMHlhbSUyMHR1YmVyJTIwdmVnZXRhYmxlfGVufDF8fHx8MTc3MjU3MjE4M3ww&ixlib=rb-4.1.0&q=80&w=400',
  },
  {
    id: 'pp3',
    produit: 'Tomates fraîches',
    categorie: 'Légumes',
    quantite: 500,
    unite: 'kg',
    prixUnitaire: 250,
    qualite: 'B',
    vendeurType: 'producteur',
    vendeurNom: 'Bamba Seydou',
    vendeurId: 'PROD-003',
    village: 'Bouaké',
    region: 'Gbèkè',
    telephone: '+225 01 45 67 89',
    scoreVendeur: 61,
    datePublication: '2026-03-02',
    image: 'https://images.unsplash.com/photo-1701125242150-8b93be3f7989?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxyaXBlJTIwcmVkJTIwdG9tYXRvZXMlMjBmcmVzaHxlbnwxfHx8fDE3NzI1NzIxODR8MA&ixlib=rb-4.1.0&q=80&w=400',
  },
  {
    id: 'pp4',
    produit: 'Maïs sec',
    categorie: 'Céréales',
    quantite: 2000,
    unite: 'kg',
    prixUnitaire: 200,
    qualite: 'A',
    vendeurType: 'producteur',
    vendeurNom: 'Coulibaly Fatoumata',
    vendeurId: 'PROD-004',
    village: 'Korhogo',
    region: 'Poro',
    telephone: '+225 07 56 78 90',
    scoreVendeur: 82,
    datePublication: '2026-03-03',
    image: 'https://images.unsplash.com/photo-1764050446111-335a35cc7220?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb3JuJTIwbWFpemUlMjB5ZWxsb3clMjBncmFpbnxlbnwxfHx8fDE3NzI1NzIxODR8MA&ixlib=rb-4.1.0&q=80&w=400',
  },
  {
    id: 'pp5',
    produit: 'Banane plantain',
    categorie: 'Fruits',
    quantite: 300,
    unite: 'régimes',
    prixUnitaire: 1500,
    qualite: 'B',
    vendeurType: 'producteur',
    vendeurNom: 'Diabaté Ibrahim',
    vendeurId: 'PROD-005',
    village: 'Man',
    region: 'Tonkpi',
    telephone: '+225 05 67 89 01',
    scoreVendeur: 55,
    datePublication: '2026-02-28',
    image: 'https://images.unsplash.com/photo-1750601455197-a7ba46fb1544?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwbGFudGFpbiUyMGJhbmFuYSUyMGJ1bmNoJTIwZ3JlZW58ZW58MXx8fHwxNzcyNTcyMTg0fDA&ixlib=rb-4.1.0&q=80&w=400',
  },
  {
    id: 'pp6',
    produit: 'Manioc',
    categorie: 'Tubercules',
    quantite: 750,
    unite: 'kg',
    prixUnitaire: 150,
    qualite: 'A',
    vendeurType: 'producteur',
    vendeurNom: 'Yao Akissi',
    vendeurId: 'PROD-006',
    village: 'Divo',
    region: 'Lôh-Djiboua',
    telephone: '+225 01 78 90 12',
    scoreVendeur: 67,
    datePublication: '2026-03-01',
    image: 'https://images.unsplash.com/photo-1757283961570-682154747d9c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjYXNzYXZhJTIwbWFuaW9jJTIwcm9vdCUyMHZlZ2V0YWJsZXxlbnwxfHx8fDE3NzI1NzIxODV8MA&ixlib=rb-4.1.0&q=80&w=400',
  },
  {
    id: 'pp7',
    produit: 'Arachides',
    categorie: 'Légumineuses',
    quantite: 400,
    unite: 'kg',
    prixUnitaire: 800,
    qualite: 'A',
    vendeurType: 'producteur',
    vendeurNom: 'Kone Mamoudou',
    vendeurId: 'PROD-007',
    village: 'Daloa',
    region: 'Haut-Sassandra',
    telephone: '+225 07 89 01 23',
    scoreVendeur: 79,
    datePublication: '2026-03-03',
    image: 'https://images.unsplash.com/photo-1594900689460-fdad3599342c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwZWFudXRzJTIwZ3JvdW5kbnV0cyUyMGFyYWNoaWRlc3xlbnwxfHx8fDE3NzI1NzIxODV8MA&ixlib=rb-4.1.0&q=80&w=400',
  },
  {
    id: 'pp8',
    produit: 'Gombo séché',
    categorie: 'Légumes',
    quantite: 120,
    unite: 'kg',
    prixUnitaire: 1200,
    qualite: 'B',
    vendeurType: 'producteur',
    vendeurNom: 'Soro Nakourou',
    vendeurId: 'PROD-008',
    village: 'Séguéla',
    region: 'Worodougou',
    telephone: '+225 05 90 12 34',
    scoreVendeur: 43,
    datePublication: '2026-03-02',
    image: 'https://images.unsplash.com/photo-1660295650824-347bd37b6956?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxva3JhJTIwZ29tYm8lMjBncmVlbiUyMHZlZ2V0YWJsZSUyMGRyaWVkfGVufDF8fHx8MTc3MjU3MjE4Nnww&ixlib=rb-4.1.0&q=80&w=400',
  },
];

// ─── Produits publiés par la Coopérative ──────────────────────────
// Visibles par : Marchand (Tab 1)

export const PRODUITS_COOPERATIVE: ProduitMarche[] = [
  {
    id: 'pc1',
    produit: 'Riz local (Coop)',
    categorie: 'Céréales',
    quantite: 800,
    unite: 'kg',
    prixUnitaire: 720,
    prixOrigine: 620,
    vendeurOrigineNom: 'Kouassi Jean-Baptiste',
    qualite: 'A',
    vendeurType: 'cooperative',
    vendeurNom: 'Coop Agricole du Bélier',
    vendeurId: 'COOP-001',
    village: 'Yamoussoukro',
    region: 'Bélier',
    telephone: '+225 27 30 20 30',
    scoreVendeur: 91,
    datePublication: '2026-03-02',
    image: 'https://images.unsplash.com/photo-1763347120796-f811f8d8337a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsb2NhbCUyMHJpY2UlMjBncmFpbnMlMjB3aGl0ZSUyMGFmcmljYW58ZW58MXx8fHwxNzcyNTcyMTgzfDA&ixlib=rb-4.1.0&q=80&w=400',
  },
  {
    id: 'pc2',
    produit: 'Ignames fraîches (Coop)',
    categorie: 'Tubercules',
    quantite: 600,
    unite: 'kg',
    prixUnitaire: 450,
    prixOrigine: 380,
    vendeurOrigineNom: 'Traoré Aminata',
    qualite: 'A',
    vendeurType: 'cooperative',
    vendeurNom: 'Coop Agricole du Bélier',
    vendeurId: 'COOP-001',
    village: 'Yamoussoukro',
    region: 'Bélier',
    telephone: '+225 27 30 20 30',
    scoreVendeur: 91,
    datePublication: '2026-03-03',
    image: 'https://images.unsplash.com/photo-1757332051150-a5b3c4510af8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmcmVzaCUyMHlhbSUyMHR1YmVyJTIwdmVnZXRhYmxlfGVufDF8fHx8MTc3MjU3MjE4M3ww&ixlib=rb-4.1.0&q=80&w=400',
  },
  {
    id: 'pc3',
    produit: 'Maïs sec (Coop)',
    categorie: 'Céréales',
    quantite: 1500,
    unite: 'kg',
    prixUnitaire: 260,
    prixOrigine: 200,
    vendeurOrigineNom: 'Coulibaly Fatoumata',
    qualite: 'A',
    vendeurType: 'cooperative',
    vendeurNom: 'Coop Agricole du Bélier',
    vendeurId: 'COOP-001',
    village: 'Yamoussoukro',
    region: 'Bélier',
    telephone: '+225 27 30 20 30',
    scoreVendeur: 91,
    datePublication: '2026-03-03',
    image: 'https://images.unsplash.com/photo-1764050446111-335a35cc7220?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb3JuJTIwbWFpemUlMjB5ZWxsb3clMjBncmFpbnxlbnwxfHx8fDE3NzI1NzIxODR8MA&ixlib=rb-4.1.0&q=80&w=400',
  },
  {
    id: 'pc4',
    produit: 'Arachides décortiquées',
    categorie: 'Légumineuses',
    quantite: 300,
    unite: 'kg',
    prixUnitaire: 950,
    prixOrigine: 800,
    vendeurOrigineNom: 'Kone Mamoudou',
    qualite: 'A',
    vendeurType: 'cooperative',
    vendeurNom: 'Coop Agricole du Bélier',
    vendeurId: 'COOP-001',
    village: 'Yamoussoukro',
    region: 'Bélier',
    telephone: '+225 27 30 20 30',
    scoreVendeur: 91,
    datePublication: '2026-03-04',
    image: 'https://images.unsplash.com/photo-1594900689460-fdad3599342c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwZWFudXRzJTIwZ3JvdW5kbnV0cyUyMGFyYWNoaWRlc3xlbnwxfHx8fDE3NzI1NzIxODV8MA&ixlib=rb-4.1.0&q=80&w=400',
  },
];

// ─── Commandes croisées ────────────────────────────────���─────────

export const COMMANDES_MARCHE: CommandeMarche[] = [
  // Commandes Coop → Producteur
  {
    id: 'cm1',
    acheteurType: 'cooperative',
    acheteurNom: 'Coop Agricole du Bélier',
    vendeurType: 'producteur',
    vendeurId: 'PROD-001',
    vendeurNom: 'Kouassi Jean-Baptiste',
    produit: 'Riz local',
    quantite: 500,
    unite: 'kg',
    prixUnitaire: 620,
    montantTotal: 310000,
    statut: 'acceptee',
    dateCreation: '2026-03-01',
    dateLivraison: '2026-03-10',
  },
  {
    id: 'cm2',
    acheteurType: 'cooperative',
    acheteurNom: 'Coop Agricole du Bélier',
    vendeurType: 'producteur',
    vendeurId: 'PROD-002',
    vendeurNom: 'Traoré Aminata',
    produit: 'Ignames fraîches',
    quantite: 350,
    unite: 'kg',
    prixUnitaire: 380,
    montantTotal: 133000,
    statut: 'en_negociation',
    dateCreation: '2026-03-02',
    dateLivraison: '2026-03-12',
    messageNegociation: 'Nous pouvons offrir 360 FCFA/kg pour une commande de 400 kg',
    prixNegocie: 360,
  },
  {
    id: 'cm3',
    acheteurType: 'cooperative',
    acheteurNom: 'Coop Agricole du Bélier',
    vendeurType: 'producteur',
    vendeurId: 'PROD-007',
    vendeurNom: 'Kone Mamoudou',
    produit: 'Arachides',
    quantite: 200,
    unite: 'kg',
    prixUnitaire: 800,
    montantTotal: 160000,
    statut: 'livree',
    dateCreation: '2026-02-20',
    dateLivraison: '2026-03-01',
  },
  // Commandes Marchand → Coopérative
  {
    id: 'cm4',
    acheteurType: 'marchand',
    acheteurNom: 'Marché Central Abidjan',
    vendeurType: 'cooperative',
    vendeurId: 'COOP-001',
    vendeurNom: 'Coop Agricole du Bélier',
    produit: 'Riz local (Coop)',
    quantite: 300,
    unite: 'kg',
    prixUnitaire: 720,
    montantTotal: 216000,
    statut: 'acceptee',
    dateCreation: '2026-03-03',
    dateLivraison: '2026-03-15',
  },
  {
    id: 'cm5',
    acheteurType: 'marchand',
    acheteurNom: 'Marché Central Abidjan',
    vendeurType: 'cooperative',
    vendeurId: 'COOP-001',
    vendeurNom: 'Coop Agricole du Bélier',
    produit: 'Maïs sec (Coop)',
    quantite: 500,
    unite: 'kg',
    prixUnitaire: 260,
    montantTotal: 130000,
    statut: 'acceptee',
    dateCreation: '2026-03-02',
    dateLivraison: '2026-03-12',
  },
  // Commandes Marchand → Producteur (direct)
  {
    id: 'cm6',
    acheteurType: 'marchand',
    acheteurNom: 'Marché Central Abidjan',
    vendeurType: 'producteur',
    vendeurId: 'PROD-005',
    vendeurNom: 'Diabaté Ibrahim',
    produit: 'Banane plantain',
    quantite: 50,
    unite: 'régimes',
    prixUnitaire: 1500,
    montantTotal: 75000,
    statut: 'en_negociation',
    dateCreation: '2026-03-02',
    dateLivraison: '2026-03-08',
    messageNegociation: 'Proposez 1300 FCFA / régime pour 80 régimes',
    prixNegocie: 1300,
  },
  {
    id: 'cm7',
    acheteurType: 'marchand',
    acheteurNom: 'Marché Central Abidjan',
    vendeurType: 'producteur',
    vendeurId: 'PROD-003',
    vendeurNom: 'Bamba Seydou',
    produit: 'Tomates fraîches',
    quantite: 100,
    unite: 'kg',
    prixUnitaire: 250,
    montantTotal: 25000,
    statut: 'livree',
    dateCreation: '2026-02-25',
    dateLivraison: '2026-03-01',
  },
];

// ─── Notifications croisées ───────────────────────────────────────

export const NOTIFS_MARCHE: NotifMarche[] = [
  // Pour le Producteur (Kouassi Jean-Baptiste) — commande de la Coop
  {
    id: 'nm1',
    destinataireType: 'producteur',
    commandeId: 'cm1',
    produit: 'Riz local',
    acheteurNom: 'Coop Agricole du Bélier',
    quantite: 500,
    unite: 'kg',
    montantTotal: 310000,
    statut: 'acceptee',
    dateCreation: '2026-03-01',
    lu: false,
  },
  {
    id: 'nm2',
    destinataireType: 'producteur',
    commandeId: 'cm2',
    produit: 'Ignames fraîches',
    acheteurNom: 'Coop Agricole du Bélier',
    quantite: 350,
    unite: 'kg',
    montantTotal: 133000,
    statut: 'en_negociation',
    dateCreation: '2026-03-02',
    lu: false,
  },
  // Pour la Coopérative — commandes du Marchand
  {
    id: 'nm3',
    destinataireType: 'cooperative',
    commandeId: 'cm4',
    produit: 'Riz local (Coop)',
    acheteurNom: 'Marché Central Abidjan',
    quantite: 300,
    unite: 'kg',
    montantTotal: 216000,
    statut: 'acceptee',
    dateCreation: '2026-03-03',
    lu: false,
  },
  // Pour le Producteur (Diabaté Ibrahim) — commande directe du Marchand
  {
    id: 'nm4',
    destinataireType: 'producteur',
    commandeId: 'cm6',
    produit: 'Banane plantain',
    acheteurNom: 'Marché Central Abidjan',
    quantite: 50,
    unite: 'régimes',
    montantTotal: 75000,
    statut: 'en_negociation',
    dateCreation: '2026-03-02',
    lu: true,
  },
];

// ─── Helpers ──────────────────────────────────────────────────────

export const Q_LABELS: Record<QualiteType, { label: string; color: string; bg: string }> = {
  A: { label: 'Qualité A', color: '#16A34A', bg: '#F0FDF4' },
  B: { label: 'Qualité B', color: '#D97706', bg: '#FFFBEB' },
  C: { label: 'Qualité C', color: '#9CA3AF', bg: '#F9FAFB' },
};

export const STATUT_CMD_LABELS: Record<StatutCommande, { label: string; color: string; bg: string; border: string }> = {
  en_attente:     { label: 'En attente',    color: '#EA580C', bg: '#FFF7ED', border: '#FED7AA' },
  acceptee:       { label: 'Acceptée',      color: '#2072AF', bg: '#EBF4FB', border: '#BFDBFE' },
  en_negociation: { label: 'Négociation',   color: '#8B5CF6', bg: '#F5F3FF', border: '#DDD6FE' },
  refusee:        { label: 'Refusée',       color: '#DC2626', bg: '#FEF2F2', border: '#FECACA' },
  livree:         { label: 'Livrée',        color: '#16A34A', bg: '#F0FDF4', border: '#BBF7D0' },
  annulee:        { label: 'Annulée',       color: '#6B7280', bg: '#F9FAFB', border: '#E5E7EB' },
};

// Thèmes couleur par profil
export const THEME_PROFIL = {
  producteur:  { primary: '#2E8B57', light: '#F0FDF4', dark: '#1F6B3F' },
  cooperative: { primary: '#2072AF', light: '#EBF4FB', dark: '#1E5A8E' },
  marchand:    { primary: '#C66A2C', light: '#FFF7ED', dark: '#A0541E' },
};