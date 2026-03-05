import React, { createContext, useContext, ReactNode } from 'react';
import { ModuleAcces, NiveauAcces, InstitutionBO } from './BackOfficeContext';
import { useBackOffice } from './BackOfficeContext';

// ────────────────────────────────────────────────────────────────────────────
// ✅ NETTOYAGE PHASE 2 : Ce context utilise maintenant les données du BackOfficeContext
// TODO: En production, charger le profil depuis Supabase via session JWT
// ────────────────────────────────────────────────────────────────────────────

interface InstitutionAccessContextType {
  institutionProfil: InstitutionBO | null;
  canAccess: (module: keyof ModuleAcces) => boolean;
  getLevel: (module: keyof ModuleAcces) => NiveauAcces;
  isComplet: (module: keyof ModuleAcces) => boolean;
  isLecture: (module: keyof ModuleAcces) => boolean;
}

const InstitutionAccessContext = createContext<InstitutionAccessContextType | undefined>(undefined);

// ✅ ID simulée de l'institution connectée (en prod ce serait dans le JWT/session)
// TODO: Charger depuis la session Supabase
const CONNECTED_INSTITUTION_ID = 'inst1';

export function InstitutionAccessProvider({ children }: { children: ReactNode }) {
  const { institutions } = useBackOffice();
  
  // ✅ NETTOYAGE PHASE 2 : Utilise les institutions du BackOfficeContext
  // TODO: Charger depuis Supabase via session utilisateur
  const institutionProfil = institutions.find(i => i.id === CONNECTED_INSTITUTION_ID) || null;

  const getLevel = (module: keyof ModuleAcces): NiveauAcces => {
    return institutionProfil?.modules[module] || 'aucun';
  };

  const canAccess = (module: keyof ModuleAcces): boolean => {
    if (!institutionProfil) return false;
    return institutionProfil.modules[module] !== 'aucun' && institutionProfil.statut === 'actif';
  };

  const isComplet = (module: keyof ModuleAcces): boolean => {
    if (!institutionProfil) return false;
    return institutionProfil.modules[module] === 'complet' && institutionProfil.statut === 'actif';
  };

  const isLecture = (module: keyof ModuleAcces): boolean => {
    if (!institutionProfil) return false;
    return institutionProfil.modules[module] === 'lecture' && institutionProfil.statut === 'actif';
  };

  return (
    <InstitutionAccessContext.Provider value={{ institutionProfil, canAccess, getLevel, isComplet, isLecture }}>
      {children}
    </InstitutionAccessContext.Provider>
  );
}

export function useInstitutionAccess() {
  const ctx = useContext(InstitutionAccessContext);
  if (!ctx) throw new Error('useInstitutionAccess must be used within InstitutionAccessProvider');
  return ctx;
}
