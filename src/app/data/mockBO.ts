/**
 * JULABA - Données de référence Back Office (BO)
 * Fichier temporaire en attendant la création du vrai Back Office
 * 
 * Ce fichier simule :
 * - Les agents BO qui valident/rejettent les identifications
 * - Les identifications en attente de validation
 * - Les messages de notification standardisés
 */

// ============================================================
// AGENTS BACK OFFICE
// ============================================================

export interface AgentBO {
  id: string;
  nom: string;
  prenom: string;
  telephone: string;
  email: string;
  zone: string;
  actif: boolean;
}

export const AGENTS_BO: AgentBO[] = [
  {
    id: 'bo-001',
    nom: 'KOFFI',
    prenom: 'Jean-Baptiste',
    telephone: '0701020304',
    email: 'jb.koffi@julaba.ci',
    zone: 'Abidjan Centre',
    actif: true,
  },
  {
    id: 'bo-002',
    nom: 'COULIBALY',
    prenom: 'Aminata',
    telephone: '0501020304',
    email: 'a.coulibaly@julaba.ci',
    zone: 'Abidjan Nord',
    actif: true,
  },
  {
    id: 'bo-003',
    nom: 'DIALLO',
    prenom: 'Moussa',
    telephone: '0771020304',
    email: 'm.diallo@julaba.ci',
    zone: 'Bouaké',
    actif: true,
  },
];

// ============================================================
// STATUTS D'IDENTIFICATION (CANONICAL)
// ============================================================

export type StatutBO = 'draft' | 'soumis' | 'valide' | 'rejete';

export const STATUT_LABELS: Record<StatutBO, string> = {
  draft: 'Brouillon',
  soumis: 'En attente validation BO',
  valide: 'Validé par BO',
  rejete: 'Rejeté par BO',
};

export const STATUT_COLORS: Record<StatutBO, { bg: string; text: string; border: string }> = {
  draft: { bg: 'bg-gray-100', text: 'text-gray-700', border: 'border-gray-300' },
  soumis: { bg: 'bg-amber-100', text: 'text-amber-700', border: 'border-amber-300' },
  valide: { bg: 'bg-green-100', text: 'text-green-700', border: 'border-green-300' },
  rejete: { bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-300' },
};

// ============================================================
// RAISONS DE REJET STANDARDISÉES
// ============================================================

export const RAISONS_REJET = [
  'Photo d\'identité floue ou illisible',
  'Photo du marchand/producteur de mauvaise qualité',
  'Informations personnelles incomplètes',
  'Numéro de téléphone invalide ou déjà utilisé',
  'Géolocalisation manquante ou incorrecte',
  'Signature numérique absente',
  'Activité commerciale non précisée',
  'Zone d\'exercice non conforme à la zone de l\'agent',
  'Doublon avec une fiche existante',
  'Documents non conformes aux exigences JULABA',
];

// ============================================================
// MESSAGES DE NOTIFICATION (SCÉNARIOS 01 et 02)
// ============================================================

/**
 * SCÉNARIO 01 : Validation par le BO
 */
export const getNotifValidationIdentificateur = (params: {
  nomActeur: string;
  prenomActeur: string;
  typeActeur: 'marchand' | 'producteur';
  numeroFiche: string;
  nomAgentBO: string;
}) => ({
  titre: 'Identification validée',
  message: `Bonne nouvelle ! La fiche d'identification de ${params.prenomActeur} ${params.nomActeur} (${params.typeActeur === 'marchand' ? 'Marchand' : 'Producteur'}) a été validée par le Back Office. Numéro de fiche : ${params.numeroFiche}. Son compte JULABA est maintenant actif. Merci pour votre travail de terrain !`,
});

export const getSMSValidationActeur = (params: {
  prenomActeur: string;
  typeActeur: 'marchand' | 'producteur';
  numeroFiche: string;
  telephone: string;
}) => ({
  numero: params.telephone,
  message: `Bonjour ${params.prenomActeur} ! Votre inscription sur JULABA a ete validee. Votre numero est ${params.numeroFiche}. Telechargez JULABA et connectez-vous avec votre telephone pour acceder a votre compte. Bienvenue dans la famille JULABA CI !`,
});

/**
 * SCÉNARIO 02 : Rejet par le BO
 */
export const getNotifRejetIdentificateur = (params: {
  nomActeur: string;
  prenomActeur: string;
  typeActeur: 'marchand' | 'producteur';
  numeroFiche: string;
  raisons: string[];
  nomAgentBO: string;
}) => ({
  titre: 'Identification rejetée',
  message: `La fiche d'identification de ${params.prenomActeur} ${params.nomActeur} (${params.typeActeur === 'marchand' ? 'Marchand' : 'Producteur'}) - N° ${params.numeroFiche} - a été rejetée par le Back Office.\n\nRaison(s) :\n${params.raisons.map(r => `• ${r}`).join('\n')}\n\nVeuillez corriger la fiche et la soumettre à nouveau.`,
});

export const getSMSRejetActeur = (params: {
  prenomActeur: string;
  numeroFiche: string;
  telephone: string;
  raisons: string[];
}) => ({
  numero: params.telephone,
  message: `Bonjour ${params.prenomActeur}, votre dossier JULABA (${params.numeroFiche}) n'a pas pu etre valide. Raison : ${params.raisons[0]}. Votre agent JULABA va vous recontacter pour corriger votre dossier. Merci de votre comprehension.`,
});

// ============================================================
// IDENTIFICATIONS EN ATTENTE (MOCK DATA)
// ============================================================

export interface IdentificationBO {
  id: string;
  numeroFiche: string;
  statut: StatutBO;
  typeActeur: 'marchand' | 'producteur';

  // Acteur identifié
  nomActeur: string;
  prenomActeur: string;
  telephoneActeur: string;
  communeActeur: string;
  activiteActeur: string;
  photoActeur?: string;

  // Agent identificateur
  nomIdentificateur: string;
  prenomIdentificateur: string;
  telephoneIdentificateur: string;
  dateIdentification: string;

  // Workflow BO
  dateSubmission?: string;
  dateValidation?: string;
  dateRejet?: string;
  agentBOId?: string;
  agentBONom?: string;
  raisonsRejet?: string[];

  // Compte créé après validation
  compteCreé: boolean;
  compteUserId?: string;
}

export const MOCK_IDENTIFICATIONS_BO: IdentificationBO[] = [
  {
    id: 'ident-001',
    numeroFiche: 'MARCH-2026-0001',
    statut: 'valide',
    typeActeur: 'marchand',
    nomActeur: 'KONÉ',
    prenomActeur: 'Fatou',
    telephoneActeur: '0707080910',
    communeActeur: 'Adjamé',
    activiteActeur: 'Vente de tomates et légumes',
    nomIdentificateur: 'BAMBA',
    prenomIdentificateur: 'Issa',
    telephoneIdentificateur: '0101020304',
    dateIdentification: '2026-02-10T09:30:00Z',
    dateSubmission: '2026-02-10T10:00:00Z',
    dateValidation: '2026-02-11T14:00:00Z',
    agentBOId: 'bo-001',
    agentBONom: 'KOFFI Jean-Baptiste',
    compteCreé: true,
    compteUserId: 'user-march-001',
  },
  {
    id: 'ident-002',
    numeroFiche: 'PROD-2026-0001',
    statut: 'soumis',
    typeActeur: 'producteur',
    nomActeur: 'TRAORÉ',
    prenomActeur: 'Mamadou',
    telephoneActeur: '0505060708',
    communeActeur: 'Daloa',
    activiteActeur: 'Production de manioc et d\'igname',
    nomIdentificateur: 'BAMBA',
    prenomIdentificateur: 'Issa',
    telephoneIdentificateur: '0101020304',
    dateIdentification: '2026-02-28T08:15:00Z',
    dateSubmission: '2026-02-28T09:00:00Z',
    compteCreé: false,
  },
  {
    id: 'ident-003',
    numeroFiche: 'MARCH-2026-0002',
    statut: 'rejete',
    typeActeur: 'marchand',
    nomActeur: 'DIOMANDÉ',
    prenomActeur: 'Aïcha',
    telephoneActeur: '0707171819',
    communeActeur: 'Yopougon',
    activiteActeur: 'Vente de riz et céréales',
    nomIdentificateur: 'BAMBA',
    prenomIdentificateur: 'Issa',
    telephoneIdentificateur: '0101020304',
    dateIdentification: '2026-02-25T11:00:00Z',
    dateSubmission: '2026-02-25T11:30:00Z',
    dateRejet: '2026-02-26T10:00:00Z',
    agentBOId: 'bo-002',
    agentBONom: 'COULIBALY Aminata',
    raisonsRejet: ['Photo du marchand de mauvaise qualité', 'Géolocalisation manquante ou incorrecte'],
    compteCreé: false,
  },
  {
    id: 'ident-004',
    numeroFiche: 'MARCH-2026-0003',
    statut: 'draft',
    typeActeur: 'marchand',
    nomActeur: 'OUATTARA',
    prenomActeur: 'Ibrahim',
    telephoneActeur: '0101234567',
    communeActeur: 'Cocody',
    activiteActeur: 'Vente de fruits',
    nomIdentificateur: 'BAMBA',
    prenomIdentificateur: 'Issa',
    telephoneIdentificateur: '0101020304',
    dateIdentification: '2026-03-01T14:00:00Z',
    compteCreé: false,
  },
];

// ============================================================
// HELPERS
// ============================================================

export function getIdentificationByNumero(numero: string): IdentificationBO | undefined {
  return MOCK_IDENTIFICATIONS_BO.find(i => i.numeroFiche === numero);
}

export function getIdentificationsByStatut(statut: StatutBO): IdentificationBO[] {
  return MOCK_IDENTIFICATIONS_BO.filter(i => i.statut === statut);
}

export function countByStatut(): Record<StatutBO, number> {
  return {
    draft: MOCK_IDENTIFICATIONS_BO.filter(i => i.statut === 'draft').length,
    soumis: MOCK_IDENTIFICATIONS_BO.filter(i => i.statut === 'soumis').length,
    valide: MOCK_IDENTIFICATIONS_BO.filter(i => i.statut === 'valide').length,
    rejete: MOCK_IDENTIFICATIONS_BO.filter(i => i.statut === 'rejete').length,
  };
}
