import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface ContactChannel {
  id: string;
  type: 'phone' | 'whatsapp' | 'email';
  label: string;
  detail: string;
  sublabel?: string;
  actif: boolean;
}

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
  categorie: string;
  actif: boolean;
  ordre: number;
}

export interface PointPhysique {
  actif: boolean;
  description: string;
  horaires: string;
}

export interface SupportConfig {
  emailSupport: string;
  phoneSupport: string;
  horaires: string;
  urlFAQ: string;
  urlGuide: string;
  contacts: ContactChannel[];
  messageAccueil: string;
  serviceActif: boolean;
  horairesDisponibilite: string;
  faq: FAQItem[];
  pointPhysique: PointPhysique;
}

interface SupportConfigContextType {
  config: SupportConfig;
  updateConfig: (updates: Partial<SupportConfig>) => void;
}

const DEFAULT_CONTACTS: ContactChannel[] = [
  { id: '1', type: 'phone', label: 'Appeler le support', detail: '+225 27 20 00 00 00', sublabel: 'Lun-Ven 8h-18h', actif: true },
  { id: '2', type: 'whatsapp', label: 'WhatsApp', detail: '0700000000', sublabel: 'Réponse rapide', actif: true },
  { id: '3', type: 'email', label: 'Email', detail: 'support@julaba.ci', sublabel: 'Réponse sous 24h', actif: true },
];

const DEFAULT_FAQ: FAQItem[] = [
  { id: 'faq1', question: 'Comment ouvrir ma journée de vente ?', answer: 'Depuis le dashboard, appuie sur "Ouvrir la journée" et saisis ton fond de caisse initial.', categorie: 'transaction', actif: true, ordre: 1 },
  { id: 'faq2', question: "Comment consulter mon solde ?", answer: "Ton solde est affiché en haut de ton dashboard dans la carte portefeuille.", categorie: 'solde', actif: true, ordre: 2 },
  { id: 'faq3', question: "J'ai un problème de connexion, que faire ?", answer: "Vérifie ta connexion internet. Si le problème persiste, essaie de te déconnecter et reconnecte-toi.", categorie: 'connexion', actif: true, ordre: 3 },
  { id: 'faq4', question: 'Comment signaler une transaction incorrecte ?', answer: 'Ouvre un ticket de support en bas de cette page avec le détail de la transaction concernée.', categorie: 'transaction', actif: true, ordre: 4 },
];

const DEFAULT_CONFIG: SupportConfig = {
  emailSupport: 'support@julaba.ci',
  phoneSupport: '+225 27 20 00 00 00',
  horaires: 'Lun-Ven 8h-18h, Sam 8h-13h',
  urlFAQ: 'https://julaba.ci/faq',
  urlGuide: 'https://julaba.ci/guide',
  contacts: DEFAULT_CONTACTS,
  messageAccueil: 'Notre équipe est là pour t\'aider',
  serviceActif: true,
  horairesDisponibilite: 'Lun-Ven 8h-18h',
  faq: DEFAULT_FAQ,
  pointPhysique: {
    actif: true,
    description: 'Rends-toi dans une agence JÙLABA agréée pour obtenir une aide en personne.',
    horaires: 'Lun-Sam 8h-17h',
  },
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
