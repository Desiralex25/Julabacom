import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface Institution {
  id: string;
  nom: string;
  type: string;
  modules: string[];
  statut: string;
}

interface InstitutionContextType {
  institution: Institution | null;
  setInstitution: (institution: Institution | null) => void;
}

const InstitutionContext = createContext<InstitutionContextType | undefined>(undefined);

export function InstitutionProvider({ children }: { children: ReactNode }) {
  const [institution, setInstitution] = useState<Institution | null>(null);

  const value: InstitutionContextType = {
    institution,
    setInstitution,
  };

  return <InstitutionContext.Provider value={value}>{children}</InstitutionContext.Provider>;
}

export function useInstitution() {
  const context = useContext(InstitutionContext);
  if (!context) {
    throw new Error('useInstitution must be used within InstitutionProvider');
  }
  return context;
}
