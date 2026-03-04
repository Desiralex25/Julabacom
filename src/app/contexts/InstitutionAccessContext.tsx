import React, { createContext, useContext, ReactNode } from 'react';
import { ModuleAcces, NiveauAcces, InstitutionBO, MOCK_INSTITUTIONS } from './BackOfficeContext';

// ────────────────────────────────────────────────────────────────────────────
// Ce context fournit à l'interface Institution les permissions définies par
// le BackOffice. En production, on chargerait le profil depuis une API.
// En mode mock, on simule que l'institution connectée est inst1 (CNPS).
// ────────────────────────────────────────────────────────────────────────────

interface InstitutionAccessContextType {
  institutionProfil: InstitutionBO;
  canAccess: (module: keyof ModuleAcces) => boolean;
  getLevel: (module: keyof ModuleAcces) => NiveauAcces;
  isComplet: (module: keyof ModuleAcces) => boolean;
  isLecture: (module: keyof ModuleAcces) => boolean;
}

const InstitutionAccessContext = createContext<InstitutionAccessContextType | undefined>(undefined);

// ID simulée de l'institution connectée (en prod ce serait dans le JWT/session)
const CONNECTED_INSTITUTION_ID = 'inst1';

export function InstitutionAccessProvider({ children }: { children: ReactNode }) {
  // Lecture depuis les mock data (en prod : depuis l'API ou BackOfficeContext en temps réel)
  const [institutions, setInstitutions] = React.useState<InstitutionBO[]>(MOCK_INSTITUTIONS);
  const institutionProfil = institutions.find(i => i.id === CONNECTED_INSTITUTION_ID) || MOCK_INSTITUTIONS[0];

  const getLevel = (module: keyof ModuleAcces): NiveauAcces => {
    return institutionProfil.modules[module];
  };

  const canAccess = (module: keyof ModuleAcces): boolean => {
    return institutionProfil.modules[module] !== 'aucun' && institutionProfil.statut === 'actif';
  };

  const isComplet = (module: keyof ModuleAcces): boolean => {
    return institutionProfil.modules[module] === 'complet' && institutionProfil.statut === 'actif';
  };

  const isLecture = (module: keyof ModuleAcces): boolean => {
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
