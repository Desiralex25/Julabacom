import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface ContactChannel {
  id: string;
  type: 'phone' | 'whatsapp' | 'email';
  label: string;
  detail: string;
  actif: boolean;
}

export interface SupportConfig {
  emailSupport: string;
  phoneSupport: string;
  horaires: string;
  urlFAQ: string;
  urlGuide: string;
  contacts: ContactChannel[];
}

interface SupportConfigContextType {
  config: SupportConfig;
  updateConfig: (updates: Partial<SupportConfig>) => void;
}

const DEFAULT_CONTACTS: ContactChannel[] = [
  { id: '1', type: 'phone', label: 'Appeler le support', detail: '+225 27 20 00 00 00', actif: true },
  { id: '2', type: 'whatsapp', label: 'WhatsApp', detail: '0700000000', actif: true },
  { id: '3', type: 'email', label: 'Email', detail: 'support@julaba.ci', actif: true },
];

const DEFAULT_CONFIG: SupportConfig = {
  emailSupport: 'support@julaba.ci',
  phoneSupport: '+225 27 20 00 00 00',
  horaires: 'Lun-Ven 8h-18h, Sam 8h-13h',
  urlFAQ: 'https://julaba.ci/faq',
  urlGuide: 'https://julaba.ci/guide',
  contacts: DEFAULT_CONTACTS,
};

const SupportConfigContext = createContext<SupportConfigContextType | undefined>(undefined);

export function SupportConfigProvider({ children }: { children: ReactNode }) {
  const [config, setConfig] = useState<SupportConfig>(DEFAULT_CONFIG);

  const updateConfig = (updates: Partial<SupportConfig>) => {
    setConfig(prev => ({ ...prev, ...updates }));
  };

  const value: SupportConfigContextType = {
    config,
    updateConfig,
  };

  return (
    <SupportConfigContext.Provider value={value}>
      {children}
    </SupportConfigContext.Provider>
  );
}

export function useSupportConfig() {
  const context = useContext(SupportConfigContext);
  if (!context) {
    throw new Error('useSupportConfig must be used within SupportConfigProvider');
  }
  return context;
}
