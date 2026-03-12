import { BOActeur, BOTransaction } from '../contexts/BackOfficeContext';

// Generateur de donnees realistes pour le marche de Cocovico

// Fonctions du marche
const FONCTIONS_MARCHE = [
  'Vendeuse de legumes',
  'Vendeuse de poisson',
  'Vendeuse de poulet',
  'Vendeuse de riz',
  'Vendeuse de banane plantain',
  'Vendeuse d\'attieke',
  'Vendeuse de piment',
  'Vendeur de viande',
  'Vendeur d\'oignons',
  'Vendeur de tomate',
  'Vendeur de poisson fume',
  'Vendeuse de fruits',
  'Vendeuse de manioc',
  'Vendeuse de gombo',
];

// Produits par fonction
const PRODUITS_PAR_FONCTION: Record<string, Array<{ nom: string; prixMin: number; prixMax: number; unite: string }>> = {
  'Vendeuse de legumes': [
    { nom: 'Tomate', prixMin: 300, prixMax: 850, unite: 'tas' },
    { nom: 'Aubergine', prixMin: 200, prixMax: 1000, unite: 'tas' },
    { nom: 'Carotte', prixMin: 150, prixMax: 800, unite: 'tas' },
    { nom: 'Chou vert', prixMin: 200, prixMax: 1000, unite: 'unite' },
    { nom: 'Haricot vert', prixMin: 300, prixMax: 900, unite: 'tas' },
  ],
  'Vendeuse de poisson': [
    { nom: 'Poisson frais', prixMin: 2500, prixMax: 4000, unite: 'kg' },
    { nom: 'Tilapia', prixMin: 2000, prixMax: 3500, unite: 'kg' },
    { nom: 'Capitaine', prixMin: 3000, prixMax: 5000, unite: 'kg' },
  ],
  'Vendeuse de poulet': [
    { nom: 'Poulet entier', prixMin: 3500, prixMax: 6000, unite: 'unite' },
    { nom: 'Poulet decoup', prixMin: 2000, prixMax: 4000, unite: 'kg' },
  ],
  'Vendeuse de riz': [
    { nom: 'Riz local', prixMin: 650, prixMax: 1300, unite: 'kg' },
    { nom: 'Riz import', prixMin: 500, prixMax: 900, unite: 'kg' },
  ],
  'Vendeuse de banane plantain': [
    { nom: 'Banane plantain', prixMin: 500, prixMax: 3500, unite: 'regime' },
    { nom: 'Banane plantain', prixMin: 300, prixMax: 800, unite: 'tas' },
  ],
  'Vendeuse d\'attieke': [
    { nom: 'Attieke', prixMin: 200, prixMax: 2000, unite: 'boule' },
    { nom: 'Attieke', prixMin: 500, prixMax: 1500, unite: 'sachet' },
  ],
  'Vendeuse de piment': [
    { nom: 'Piment frais', prixMin: 300, prixMax: 1000, unite: 'tas' },
    { nom: 'Piment sec', prixMin: 400, prixMax: 1200, unite: 'tas' },
  ],
  'Vendeur de viande': [
    { nom: 'Viande boeuf', prixMin: 2500, prixMax: 4000, unite: 'kg' },
    { nom: 'Viande mouton', prixMin: 3000, prixMax: 5000, unite: 'kg' },
  ],
  'Vendeur d\'oignons': [
    { nom: 'Oignon', prixMin: 400, prixMax: 950, unite: 'kg' },
    { nom: 'Oignon', prixMin: 300, prixMax: 800, unite: 'tas' },
  ],
  'Vendeur de tomate': [
    { nom: 'Tomate', prixMin: 300, prixMax: 850, unite: 'tas' },
    { nom: 'Tomate salade', prixMin: 400, prixMax: 1000, unite: 'tas' },
  ],
  'Vendeur de poisson fume': [
    { nom: 'Poisson fume', prixMin: 1500, prixMax: 3000, unite: 'tas' },
    { nom: 'Maquereau fume', prixMin: 2000, prixMax: 3500, unite: 'kg' },
  ],
  'Vendeuse de fruits': [
    { nom: 'Orange', prixMin: 500, prixMax: 1500, unite: 'tas' },
    { nom: 'Mangue', prixMin: 600, prixMax: 2000, unite: 'tas' },
    { nom: 'Papaye', prixMin: 400, prixMax: 1200, unite: 'unite' },
  ],
  'Vendeuse de manioc': [
    { nom: 'Manioc', prixMin: 300, prixMax: 800, unite: 'tas' },
    { nom: 'Manioc', prixMin: 500, prixMax: 1500, unite: 'sac' },
  ],
  'Vendeuse de gombo': [
    { nom: 'Gombo', prixMin: 300, prixMax: 900, unite: 'tas' },
    { nom: 'Gombo sec', prixMin: 500, prixMax: 1200, unite: 'sachet' },
  ],
};

// Noms ivoiriens realistes
const NOMS_IVOIRIENS = ['Koné', 'Coulibaly', 'Yao', 'Traoré', 'Ouattara', 'Bamba', 'Diomandé', 'Koffi', 'N\'Guessan', 'Touré', 'Diabaté', 'Doumbia', 'Sangaré', 'Konaté', 'Silué', 'Kouamé', 'Aka', 'Kouassi', 'Assi', 'Brou'];
const PRENOMS_FEMININS = ['Awa', 'Fatoumata', 'Aminata', 'Mariam', 'Aïcha', 'Kadiatou', 'Salimata', 'Bintou', 'Adjoua', 'Akissi', 'Affoue', 'Ahou', 'Amoin', 'Aya', 'Gnima', 'Tenin', 'Fanta', 'Hawa', 'Assita', 'Ami'];
const PRENOMS_MASCULINS = ['Mamadou', 'Ibrahim', 'Moussa', 'Seydou', 'Aboubacar', 'Souleymane', 'Adama', 'Lassina', 'Yacouba', 'Bakary', 'Kouadio', 'Youssouf', 'Issouf', 'Drissa', 'Brahima'];

// Fonction pour generer un email
function genererEmail(prenom: string, nom: string, index: number): string {
  const hasEmail = Math.random() > 0.5; // 50% ont un email
  if (!hasEmail) return '';
  
  const prenomClean = prenom.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, '');
  const nomClean = nom.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, '').replace(/'/g, '');
  
  const formats = [
    `${prenomClean}.${nomClean}@gmail.com`,
    `${prenomClean}${nomClean}@gmail.com`,
    `${prenomClean.charAt(0)}.${nomClean}@gmail.com`,
    `${prenomClean}${Math.floor(Math.random() * 2000) + 1980}@gmail.com`,
    `${nomClean}${Math.floor(Math.random() * 2000) + 1980}@gmail.com`,
  ];
  
  return formats[index % formats.length];
}

// Fonction pour generer un numero de telephone
function genererTelephone(): string {
  const prefixes = ['07', '05', '01'];
  const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
  const part1 = String(Math.floor(Math.random() * 90) + 10);
  const part2 = String(Math.floor(Math.random() * 90) + 10);
  const part3 = String(Math.floor(Math.random() * 90) + 10);
  const part4 = String(Math.floor(Math.random() * 90) + 10);
  return `+225 ${prefix} ${part1} ${part2} ${part3} ${part4}`;
}

// Fonction pour nettoyer les numeros fournis
function nettoyerTelephone(tel: string): string {
  // Enlever tous les espaces et tirets
  const clean = tel.replace(/[\s-]/g, '');
  
  // Si ca commence par 0, ajouter +225
  if (clean.startsWith('0')) {
    const nums = clean.match(/.{1,2}/g) || [];
    return `+225 ${nums.join(' ')}`;
  }
  
  // Si c'est deja nettoye, formater
  if (clean.length === 10) {
    const nums = clean.match(/.{1,2}/g) || [];
    return `+225 ${nums.join(' ')}`;
  }
  
  return genererTelephone();
}

// Personnes reelles (31)
const PERSONNES_REELLES: Array<{ nom: string; prenoms: string; telephone: string }> = [
  { nom: 'Diomande', prenoms: 'Maodoussou', telephone: '0769617964' },
  { nom: 'Tra Lou', prenoms: 'Ange', telephone: '0594975208' },
  { nom: 'Diarassouba', prenoms: 'Maberet', telephone: '0505438738' },
  { nom: 'Ouang Youan Lou', prenoms: 'Tatiana', telephone: '0152117526' },
  { nom: 'Traore', prenoms: 'Issaho', telephone: '0101492576' },
  { nom: 'Nde Tra', prenoms: 'Victorine', telephone: '07-07-51-99-69' },
  { nom: 'Tra Lou', prenoms: 'Dorothée', telephone: '07-08-67-38-42' },
  { nom: 'Ké Lou', prenoms: 'Marceline', telephone: '05-03-18-78-53' },
  { nom: 'Zehoue Lou', prenoms: 'Salie', telephone: '07-08-42-95-80' },
  { nom: 'Irié Lou', prenoms: 'Noëlle', telephone: '07-57-29-02-03' },
  { nom: 'Zamblé Lou', prenoms: 'Ruth', telephone: '05-86-39-73-14' },
  { nom: 'Djedji', prenoms: 'Béatrice', telephone: '01-03-07-14-71' },
  { nom: 'Zerelou', prenoms: 'Michelle', telephone: '05-81-79-28-09' },
  { nom: 'Tho Lou', prenoms: 'Alia', telephone: '05-85-22-97-12' },
  { nom: 'Goh Nani', prenoms: 'Valentine', telephone: '01-50-42-60-50' },
  { nom: 'Coulibaly', prenoms: 'Anne', telephone: '07-69-02-20-24' },
  { nom: 'Kouamé', prenoms: 'Charlene', telephone: '07-16-83-86-67' },
  { nom: 'Zakba', prenoms: 'Vanessa', telephone: '05-64-45-86-07' },
  { nom: 'Kanate', prenoms: 'Minata', telephone: '07-69-19-58-40' },
  { nom: 'Zoro You', prenoms: 'Yolande', telephone: '07-77-13-53-50' },
  { nom: 'Sonda', prenoms: 'Cynthia', telephone: '07-47-19-91-10' },
  { nom: 'Vouet', prenoms: 'Tatiana', telephone: '05-55-35-56-12' },
  { nom: 'Kadiatou', prenoms: '', telephone: '05-05-59-62-75' },
  { nom: 'Gole Lou', prenoms: 'Yolande', telephone: '07-57-54-80-23' },
  { nom: 'Bolou', prenoms: 'Madelaine', telephone: '05-05-68-97-18' },
  { nom: 'Konan', prenoms: 'Amoin', telephone: '07-16-95-64-95' },
  { nom: 'Zewlou', prenoms: 'Fatou', telephone: '05-45-07-88-91' },
  { nom: 'Zewlou', prenoms: 'Kadi', telephone: '05-04-13-47-27' },
  { nom: 'Irie Lou', prenoms: '', telephone: '07-07-91-79-52' },
  { nom: 'Anet', prenoms: 'Konan', telephone: '05-75-40-16-74' },
  { nom: 'Irie', prenoms: '', telephone: '09-32-28-92-02' },
];

// Generer 73 marchands (31 reels + 42 generes)
export function genererMarchands(): BOActeur[] {
  const marchands: BOActeur[] = [];
  let idCounter = 1;
  
  // 1. Ajouter les 31 personnes reelles
  PERSONNES_REELLES.forEach((personne, index) => {
    const prenoms = personne.prenoms || (index % 2 === 0 ? PRENOMS_FEMININS[index % PRENOMS_FEMININS.length] : PRENOMS_MASCULINS[index % PRENOMS_MASCULINS.length]);
    const genre = prenoms === '' ? 'feminin' : (PRENOMS_FEMININS.includes(prenoms.split(' ')[0]) ? 'feminin' : 'masculin');
    const fonction = FONCTIONS_MARCHE[index % FONCTIONS_MARCHE.length];
    
    // Date d'inscription aleatoire entre 7 et 12 mars 2026
    const jourInscription = Math.floor(Math.random() * 6) + 7; // 7-12
    const heureInscription = Math.floor(Math.random() * 12) + 8; // 8h-20h
    const minuteInscription = Math.floor(Math.random() * 60);
    const dateInscription = new Date(2026, 2, jourInscription, heureInscription, minuteInscription);
    
    marchands.push({
      id: `COCO${String(idCounter).padStart(4, '0')}`,
      nom: personne.nom,
      prenoms: prenoms || (genre === 'feminin' ? PRENOMS_FEMININS[index % PRENOMS_FEMININS.length] : PRENOMS_MASCULINS[index % PRENOMS_MASCULINS.length]),
      telephone: nettoyerTelephone(personne.telephone),
      type: 'marchand',
      region: 'Lagunes',
      commune: 'Abidjan - Marche de Cocovico',
      statut: 'actif',
      dateInscription: dateInscription.toISOString(),
      score: 70 + (index % 30),
      transactionsTotal: 0,
      volumeTotal: 0,
      validated: true,
      identificateurId: 'MAMADOU_COULIBALY',
      zone: 'Cocovico',
      activite: fonction,
      email: genererEmail(prenoms || 'Marchand', personne.nom, index),
    });
    
    idCounter++;
  });
  
  // 2. Generer 42 marchands supplementaires (pour un total de 73)
  for (let i = 0; i < 42; i++) {
    const estFeminin = i % 3 !== 2; // 70% de femmes
    const prenoms = estFeminin 
      ? PRENOMS_FEMININS[i % PRENOMS_FEMININS.length]
      : PRENOMS_MASCULINS[i % PRENOMS_MASCULINS.length];
    const nom = NOMS_IVOIRIENS[i % NOMS_IVOIRIENS.length];
    const fonction = FONCTIONS_MARCHE[i % FONCTIONS_MARCHE.length];
    
    // Date d'inscription aleatoire entre 7 et 12 mars 2026
    const jourInscription = Math.floor(Math.random() * 6) + 7; // 7-12
    const heureInscription = Math.floor(Math.random() * 12) + 8; // 8h-20h
    const minuteInscription = Math.floor(Math.random() * 60);
    const dateInscription = new Date(2026, 2, jourInscription, heureInscription, minuteInscription);
    
    marchands.push({
      id: `COCO${String(idCounter).padStart(4, '0')}`,
      nom,
      prenoms,
      telephone: genererTelephone(),
      type: 'marchand',
      region: 'Lagunes',
      commune: 'Abidjan - Marche de Cocovico',
      statut: 'actif',
      dateInscription: dateInscription.toISOString(),
      score: 70 + (i % 30),
      transactionsTotal: 0,
      volumeTotal: 0,
      validated: true,
      identificateurId: 'MAMADOU_COULIBALY',
      zone: 'Cocovico',
      activite: fonction,
      email: genererEmail(prenoms, nom, i + 31),
    });
    
    idCounter++;
  }
  
  return marchands;
}

// Generer transactions pour un marchand
function genererTransactionsPourMarchand(marchand: BOActeur, idStart: number): BOTransaction[] {
  const transactions: BOTransaction[] = [];
  const nbVentes = Math.floor(Math.random() * 31) + 10; // 10-40 ventes
  const produits = PRODUITS_PAR_FONCTION[marchand.activite || 'Vendeuse de legumes'] || PRODUITS_PAR_FONCTION['Vendeuse de legumes'];
  
  for (let i = 0; i < nbVentes; i++) {
    const produit = produits[Math.floor(Math.random() * produits.length)];
    const quantite = Math.floor(Math.random() * 5) + 1; // 1-5 unites
    const prixUnitaire = Math.floor(Math.random() * (produit.prixMax - produit.prixMin + 1)) + produit.prixMin;
    const montant = quantite * prixUnitaire;
    
    // Date aleatoire entre 7 et 12 mars 2026
    const jour = Math.floor(Math.random() * 6) + 7; // 7-12
    const heure = Math.floor(Math.random() * 12) + 6; // 6h-18h
    const minute = Math.floor(Math.random() * 60);
    const date = new Date(2026, 2, jour, heure, minute); // mois 2 = mars
    
    transactions.push({
      id: `TX${String(idStart + i).padStart(6, '0')}`,
      acteurId: marchand.id, // Ajouter l'ID de l'acteur
      acteurNom: `${marchand.prenoms} ${marchand.nom}`,
      acteurType: 'marchand',
      produit: produit.nom,
      quantite: `${quantite} ${produit.unite}`,
      montant,
      statut: Math.random() > 0.05 ? 'validee' : 'en_cours', // 95% validees
      date: date.toISOString(),
      region: 'Lagunes',
      modePaiement: Math.random() > 0.3 ? 'Mobile Money' : 'Especes',
    });
  }
  
  return transactions;
}

// Generer toutes les transactions
export function genererTransactions(marchands: BOActeur[]): BOTransaction[] {
  let transactions: BOTransaction[] = [];
  let idCounter = 100000;
  
  marchands.forEach(marchand => {
    const txMarchand = genererTransactionsPourMarchand(marchand, idCounter);
    transactions = transactions.concat(txMarchand);
    idCounter += txMarchand.length;
  });
  
  // Trier par date decroissante
  transactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  
  return transactions;
}

// Exporter les donnees
export const MARCHANDS_COCOVICO = genererMarchands();
export const TRANSACTIONS_COCOVICO = genererTransactions(MARCHANDS_COCOVICO);

// ════════════════════════════════════════════════════════════════════════════
// NOUVEAUX ACTEURS (10 mars 2026)
// ════════════════════════════════════════════════════════════════════════════

// ─── Identificateurs fictifs ────────────────────────────────────────────────

export const IDENTIFICATEURS_FICTIFS: BOActeur[] = [
  {
    id: 'IDENT_KOUAME_JEAN',
    nom: 'KOUAME',
    prenoms: 'Jean-Baptiste',
    telephone: '+225 05 67 89 12 34',
    type: 'identificateur',
    region: 'La Mé',
    commune: 'Adzopé',
    statut: 'actif',
    dateInscription: '2026-03-08T09:00:00.000Z',
    score: 88,
    transactionsTotal: 0,
    volumeTotal: 0,
    validated: true,
    zone: 'Adzopé',
    activite: 'Agent identificateur Adzopé',
    email: 'jean.kouame@julaba.ci',
  },
  {
    id: 'IDENT_TOURE_SALIF',
    nom: 'TOURE',
    prenoms: 'Salif',
    telephone: '+225 07 45 67 89 01',
    type: 'identificateur',
    region: 'Yamoussoukro',
    commune: 'Yamoussoukro',
    statut: 'actif',
    dateInscription: '2026-03-07T10:30:00.000Z',
    score: 92,
    transactionsTotal: 0,
    volumeTotal: 0,
    validated: true,
    zone: 'Yamoussoukro',
    activite: 'Agent identificateur Yamoussoukro',
    email: 'salif.toure@julaba.ci',
  },
  {
    id: 'IDENT_BAMBA_FATOU',
    nom: 'BAMBA',
    prenoms: 'Fatoumata',
    telephone: '+225 01 23 45 67 89',
    type: 'identificateur',
    region: 'Haut-Sassandra',
    commune: 'Daloa',
    statut: 'actif',
    dateInscription: '2026-03-08T14:00:00.000Z',
    score: 85,
    transactionsTotal: 0,
    volumeTotal: 0,
    validated: true,
    zone: 'Daloa',
    activite: 'Agent identificateur Daloa',
    email: 'fatoumata.bamba@julaba.ci',
  },
];

// ─── 2 Marchands Rejetés ────────────────────────────────────────────────────

export const MARCHANDS_REJETES: BOActeur[] = [
  {
    id: 'COCO0074',
    nom: 'SANGARE',
    prenoms: 'Kadiatou',
    telephone: '+225 07 12 34 56 78',
    type: 'marchand',
    region: 'Lagunes',
    commune: 'Abidjan - Marche de Cocovico',
    statut: 'rejete',
    dateInscription: '2026-03-10T10:15:00.000Z',
    score: 0,
    transactionsTotal: 0,
    volumeTotal: 0,
    validated: false,
    identificateurId: 'MAMADOU_COULIBALY',
    zone: 'Cocovico',
    activite: 'Vendeuse de riz',
    email: 'kadiatou.sangare@gmail.com',
  },
  {
    id: 'COCO0075',
    nom: 'KONE',
    prenoms: 'Moussa',
    telephone: '+225 05 98 76 54 32',
    type: 'marchand',
    region: 'Lagunes',
    commune: 'Abidjan - Marche de Cocovico',
    statut: 'rejete',
    dateInscription: '2026-03-10T14:30:00.000Z',
    score: 0,
    transactionsTotal: 0,
    volumeTotal: 0,
    validated: false,
    identificateurId: 'MAMADOU_COULIBALY',
    zone: 'Cocovico',
    activite: 'Vendeur de viande',
    email: '',
  },
];

// ─── 2 Producteurs ──────────────────────────────────────────────────────────

export const PRODUCTEURS: BOActeur[] = [
  {
    id: 'PROD_YAMOUS_001',
    nom: 'KOUASSI',
    prenoms: 'Augustin',
    telephone: '+225 07 23 45 67 89',
    type: 'producteur',
    region: 'Yamoussoukro',
    commune: 'Yamoussoukro',
    statut: 'actif',
    dateInscription: '2026-03-10T08:30:00.000Z',
    score: 78,
    transactionsTotal: 0,
    volumeTotal: 0,
    validated: true,
    identificateurId: 'IDENT_TOURE_SALIF',
    zone: 'Yamoussoukro',
    activite: 'Producteur de cacao',
    email: 'augustin.kouassi@gmail.com',
    cni: 'CI2026YAM123456',
  },
  {
    id: 'PROD_DALOA_001',
    nom: 'GOURE',
    prenoms: 'Marie-Claire',
    telephone: '+225 05 34 56 78 90',
    type: 'producteur',
    region: 'Haut-Sassandra',
    commune: 'Daloa',
    statut: 'en_attente',
    dateInscription: '2026-03-10T11:45:00.000Z',
    score: 65,
    transactionsTotal: 0,
    volumeTotal: 0,
    validated: false,
    identificateurId: 'IDENT_BAMBA_FATOU',
    zone: 'Daloa',
    activite: 'Producteur de cafe',
    email: 'marieclaire.goure@gmail.com',
    cni: 'CI2026DAL789012',
  },
];

// ─── 2 Cooperatives ─────────────────────────────────────────────────────────

export const COOPERATIVES: BOActeur[] = [
  {
    id: 'COOP_COCOVICO',
    nom: 'Cooperative des Commercants de Cocovico',
    prenoms: 'President: Awa TRAORE',
    telephone: '+225 07 88 99 00 11',
    type: 'cooperative',
    region: 'Lagunes',
    commune: 'Abidjan - Marche de Cocovico',
    statut: 'actif',
    dateInscription: '2026-03-10T09:00:00.000Z',
    score: 85,
    transactionsTotal: 0,
    volumeTotal: 0,
    validated: true,
    identificateurId: 'MAMADOU_COULIBALY',
    zone: 'Cocovico',
    activite: 'Cooperative commerciale - 150 membres',
    email: 'contact@coop-cocovico.ci',
    cni: 'COOP-CI-2026-001',
  },
  {
    id: 'COOP_ADZOPE',
    nom: 'Cooperative Agricole d\'Adzopé',
    prenoms: 'President: Kouadio N\'GUESSAN',
    telephone: '+225 05 77 88 99 00',
    type: 'cooperative',
    region: 'La Mé',
    commune: 'Adzopé',
    statut: 'en_attente',
    dateInscription: '2026-03-10T13:20:00.000Z',
    score: 72,
    transactionsTotal: 0,
    volumeTotal: 0,
    validated: false,
    identificateurId: 'IDENT_KOUAME_JEAN',
    zone: 'Adzopé',
    activite: 'Cooperative agricole - 300 membres',
    email: 'info@coop-adzope.ci',
    cni: 'COOP-CI-2026-002',
  },
];

// ─── 1 Institution ──────────────────────────────────────────────────────────

export const INSTITUTION_DGE: BOActeur[] = [
  {
    id: 'INST_DGE_ABIDJAN',
    nom: 'Direction Generale de l\'Emploi',
    prenoms: 'Directeur: Mohamed BAMBA',
    telephone: '+225 27 20 21 22 23',
    type: 'institution',
    region: 'Lagunes',
    commune: 'Abidjan - Plateau',
    statut: 'actif',
    dateInscription: '2026-03-10T07:00:00.000Z',
    score: 95,
    transactionsTotal: 0,
    volumeTotal: 0,
    validated: true,
    identificateurId: 'MAMADOU_COULIBALY',
    zone: 'Abidjan',
    activite: 'Institution publique - Emploi et formation',
    email: 'contact@dge.gouv.ci',
    cni: 'INST-DGE-2026',
  },
];

// ─── Transactions pour les nouveaux acteurs ────────────────────────────────

function genererTransactionsProducteur(producteur: BOActeur, prefix: string): BOTransaction[] {
  const transactions: BOTransaction[] = [];
  const produits = producteur.activite?.includes('cacao') 
    ? [{ nom: 'Cacao', prixMin: 800, prixMax: 1200, unite: 'kg' }]
    : [{ nom: 'Cafe', prixMin: 1000, prixMax: 1500, unite: 'kg' }];
  
  const nbVentes = Math.floor(Math.random() * 8) + 5; // 5-12 ventes
  
  for (let i = 0; i < nbVentes; i++) {
    const produit = produits[0];
    const quantite = Math.floor(Math.random() * 500) + 100; // 100-600 kg
    const prixUnitaire = Math.floor(Math.random() * (produit.prixMax - produit.prixMin + 1)) + produit.prixMin;
    const montant = quantite * prixUnitaire;
    
    const jour = Math.floor(Math.random() * 3) + 10; // 10-12 mars
    const heure = Math.floor(Math.random() * 10) + 7;
    const minute = Math.floor(Math.random() * 60);
    const date = new Date(2026, 2, jour, heure, minute);
    
    transactions.push({
      id: `${prefix}${String(i + 1).padStart(4, '0')}`,
      acteurId: producteur.id,
      acteurNom: `${producteur.prenoms} ${producteur.nom}`,
      acteurType: 'producteur',
      produit: produit.nom,
      quantite: `${quantite} ${produit.unite}`,
      montant,
      statut: 'validee',
      date: date.toISOString(),
      region: producteur.region,
      modePaiement: 'Mobile Money',
    });
  }
  
  return transactions;
}

function genererTransactionsCooperative(cooperative: BOActeur, prefix: string): BOTransaction[] {
  const transactions: BOTransaction[] = [];
  const produits = cooperative.id === 'COOP_COCOVICO'
    ? [
        { nom: 'Lot produits maraichers', prixMin: 50000, prixMax: 150000, unite: 'lot' },
        { nom: 'Lot produits vivriers', prixMin: 80000, prixMax: 200000, unite: 'lot' },
      ]
    : [
        { nom: 'Lot cacao', prixMin: 300000, prixMax: 800000, unite: 'lot' },
        { nom: 'Lot cafe', prixMin: 200000, prixMax: 600000, unite: 'lot' },
      ];
  
  const nbVentes = Math.floor(Math.random() * 6) + 3; // 3-8 ventes
  
  for (let i = 0; i < nbVentes; i++) {
    const produit = produits[Math.floor(Math.random() * produits.length)];
    const quantite = Math.floor(Math.random() * 5) + 1; // 1-5 lots
    const prixUnitaire = Math.floor(Math.random() * (produit.prixMax - produit.prixMin + 1)) + produit.prixMin;
    const montant = quantite * prixUnitaire;
    
    const jour = Math.floor(Math.random() * 3) + 10; // 10-12 mars
    const heure = Math.floor(Math.random() * 10) + 8;
    const minute = Math.floor(Math.random() * 60);
    const date = new Date(2026, 2, jour, heure, minute);
    
    transactions.push({
      id: `${prefix}${String(i + 1).padStart(4, '0')}`,
      acteurId: cooperative.id,
      acteurNom: cooperative.nom,
      acteurType: 'cooperative',
      produit: produit.nom,
      quantite: `${quantite} ${produit.unite}`,
      montant,
      statut: 'validee',
      date: date.toISOString(),
      region: cooperative.region,
      modePaiement: 'Virement',
    });
  }
  
  return transactions;
}

// Transactions des nouveaux acteurs
const TRANSACTIONS_PRODUCTEUR_YAMOUS = genererTransactionsProducteur(PRODUCTEURS[0], 'TXPROD_Y');
const TRANSACTIONS_PRODUCTEUR_DALOA = genererTransactionsProducteur(PRODUCTEURS[1], 'TXPROD_D');
const TRANSACTIONS_COOP_COCOVICO = genererTransactionsCooperative(COOPERATIVES[0], 'TXCOOP_C');
const TRANSACTIONS_COOP_ADZOPE = genererTransactionsCooperative(COOPERATIVES[1], 'TXCOOP_A');

// ─── Export consolidé de tous les acteurs ──────────────────────────────────

export const TOUS_LES_ACTEURS = [
  ...MARCHANDS_COCOVICO,
  ...MARCHANDS_REJETES,
  ...PRODUCTEURS,
  ...COOPERATIVES,
  ...INSTITUTION_DGE,
  ...IDENTIFICATEURS_FICTIFS,
];

export const TOUTES_LES_TRANSACTIONS = [
  ...TRANSACTIONS_COCOVICO,
  ...TRANSACTIONS_PRODUCTEUR_YAMOUS,
  ...TRANSACTIONS_PRODUCTEUR_DALOA,
  ...TRANSACTIONS_COOP_COCOVICO,
  ...TRANSACTIONS_COOP_ADZOPE,
].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());