import React, { createContext, useContext, useState, ReactNode } from 'react';

interface InstitutionAccessContextType {
  hasAccess: (module: string) => boolean;
  grantAccess: (module: string) => void;
  revokeAccess: (module: string) => void;
}

const InstitutionAccessContext = createContext<InstitutionAccessContextType | undefined>(undefined);

export function InstitutionAccessProvider({ children }: { children: ReactNode }) {
  const [accessModules, setAccessModules] = useState<string[]>([]);

  const hasAccess = (module: string): boolean => {
    return accessModules.includes(module);
  };

  const grantAccess = (module: string) => {
    if (!accessModules.includes(module)) {
      setAccessModules([...accessModules, module]);
    }
  };

  const revokeAccess = (module: string) => {
    setAccessModules(accessModules.filter(m => m !== module));
  };

  const value: InstitutionAccessContextType = {
    hasAccess,
    grantAccess,
    revokeAccess,
  };

  return (
    <InstitutionAccessContext.Provider value={value}>
      {children}
    </InstitutionAccessContext.Provider>
  );
}

export function useInstitutionAccess() {
  const context = useContext(InstitutionAccessContext);
  if (!context) {
    throw new Error('useInstitutionAccess must be used within InstitutionAccessProvider');
  }
  return context;
}
