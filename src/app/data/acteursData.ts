/**
 * FICHIER VIDE - Tous les acteurs terrain ont été supprimés
 * Seuls les marchands de Cocovico (cocovicoData.ts) sont conservés
 */

export type StatutActeur = 'draft' | 'soumis' | 'approved' | 'rejected';
export type RoleActeur = 'marchand' | 'producteur' | 'cooperative';

export interface ActeurData {
  id: string;
  numero: string;
  telephone: string;
  nom: string;
  prenoms: string;
  role: RoleActeur;
  activite: string;
  marche: string;
  commune: string;
  statut: StatutActeur;
  type: 'nouveau' | 'modifie' | 'renouvellement';
  dateIdentification: string;
  dateModification: string;
  dateValidation: string | null;
  identificateur: string;
  coordonneesGPS: string;
  documents: string[];
  maZone: boolean;
  historique: { date: string; action: string; par: string; statut: string }[];
}

export function normaliserNumero(telephone: string): string {
  return telephone.replace('+225', '0').replace(/\s/g, '');
}

export function formaterTelephone(numero: string): string {
  const digits = numero.startsWith('0') ? numero : '0' + numero;
  return `+225 ${digits.slice(1, 3)} ${digits.slice(3, 5)} ${digits.slice(5, 7)} ${digits.slice(7, 9)} ${digits.slice(9, 11)}`;
}

// Tableau vide - tous les acteurs terrain ont été supprimés
export const ACTEURS_DATA: ActeurData[] = [];

export const ACTEURS_BY_NUMERO: Record<string, ActeurData> = {};
