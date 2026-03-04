import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ContactChannel {
  id: string;
  label: string;
  detail: string;
  sublabel: string;
  type: 'phone' | 'whatsapp' | 'email';
  actif: boolean;
}

export interface FAQItem {
  id: string;
  categorie: 'connexion' | 'solde' | 'technique' | 'identite' | 'transaction' | 'autre';
  question: string;
  answer: string;
  actif: boolean;
  ordre: number;
}

export interface PointPhysique {
  description: string;
  horaires: string;
  actif: boolean;
}

export interface SupportConfig {
  serviceActif: boolean;
  horairesDisponibilite: string;
  contacts: ContactChannel[];
  faq: FAQItem[];
  pointPhysique: PointPhysique;
  messageAccueil: string;
  derniereMaj: string;
}

// ─── Valeurs par défaut ───────────────────────────────────────────────────────

const DEFAULT_CONFIG: SupportConfig = {
  serviceActif: true,
  horairesDisponibilite: 'Lun–Sam, 7h–20h',
  messageAccueil: "On est là pour t'aider",
  contacts: [
    {
      id: 'phone',
      label: 'Appeler le support',
      detail: '07 00 00 00 00',
      sublabel: 'Lun–Sam, 7h–20h',
      type: 'phone',
      actif: true,
    },
    {
      id: 'whatsapp',
      label: 'WhatsApp',
      detail: '+225 07 00 00 00 00',
      sublabel: "Réponse en moins d'1h",
      type: 'whatsapp',
      actif: true,
    },
    {
      id: 'email',
      label: 'Envoyer un e-mail',
      detail: 'support@julaba.ci',
      sublabel: 'Réponse sous 24h',
      type: 'email',
      actif: true,
    },
  ],
  faq: [
    {
      id: 'faq-1',
      categorie: 'connexion',
      question: "Je n'arrive pas à me connecter",
      answer:
        "Vérifie que ton numéro est bien enregistré par ton agent. Si le problème persiste, contacte le support au 07 00 00 00 00. Ton agent peut aussi réinitialiser ton accès.",
      actif: true,
      ordre: 1,
    },
    {
      id: 'faq-2',
      categorie: 'solde',
      question: 'Mon solde ne s\'affiche pas correctement',
      answer:
        'Attends 5 minutes et rafraîchis l\'application. Si le problème continue, note la transaction et contacte le support avec ton numéro de compte.',
      actif: true,
      ordre: 2,
    },
    {
      id: 'faq-3',
      categorie: 'technique',
      question: "L'application est lente ou ne charge pas",
      answer:
        'Vérifie ta connexion internet. Ferme et rouvre l\'application. Si ça continue, vide le cache de ton téléphone ou contacte le support.',
      actif: true,
      ordre: 3,
    },
    {
      id: 'faq-4',
      categorie: 'identite',
      question: 'Mes informations sont incorrectes',
      answer:
        "Seul un agent identificateur peut modifier tes informations personnelles. Rends-toi au point JÙLABA le plus proche avec ta pièce d'identité.",
      actif: true,
      ordre: 4,
    },
    {
      id: 'faq-5',
      categorie: 'transaction',
      question: 'Je ne retrouve pas une transaction',
      answer:
        "Va dans l'historique de ton portefeuille. Filtre par date. Si tu ne trouves toujours pas, contacte le support avec la date approximative de la transaction.",
      actif: true,
      ordre: 5,
    },
  ],
  pointPhysique: {
    description:
      'Rends-toi au marché principal de ta zone. Cherche le panneau JÙLABA orange. Un agent est présent du lundi au samedi de 7h à 18h.',
    horaires: 'Lun–Sam, 7h–18h',
    actif: true,
  },
  derniereMaj: new Date().toISOString(),
};

const STORAGE_KEY = 'julaba_support_config';

// ─── Context ──────────────────────────────────────────────────────────────────

interface SupportConfigContextType {
  config: SupportConfig;
  updateConfig: (updates: Partial<SupportConfig>) => void;
  updateContact: (id: string, updates: Partial<ContactChannel>) => void;
  addContact: (contact: ContactChannel) => void;
  removeContact: (id: string) => void;
  updateFAQ: (id: string, updates: Partial<FAQItem>) => void;
  addFAQ: (item: Omit<FAQItem, 'id'>) => void;
  removeFAQ: (id: string) => void;
  reorderFAQ: (id: string, direction: 'up' | 'down') => void;
  updatePointPhysique: (updates: Partial<PointPhysique>) => void;
  resetToDefault: () => void;
  isSaving: boolean;
}

const SupportConfigContext = createContext<SupportConfigContextType | undefined>(undefined);

// ─── Provider ─────────────────────────────────────────────────────────────────

function loadFromStorage(): SupportConfig {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return DEFAULT_CONFIG;
}

function saveToStorage(config: SupportConfig) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
  } catch {}
}

export function SupportConfigProvider({ children }: { children: ReactNode }) {
  const [config, setConfig] = useState<SupportConfig>(loadFromStorage);
  const [isSaving, setIsSaving] = useState(false);

  // Simuler sauvegarde avec délai
  const persist = (newConfig: SupportConfig) => {
    setIsSaving(true);
    const updated = { ...newConfig, derniereMaj: new Date().toISOString() };
    setConfig(updated);
    saveToStorage(updated);
    setTimeout(() => setIsSaving(false), 600);
  };

  const updateConfig = (updates: Partial<SupportConfig>) => {
    persist({ ...config, ...updates });
  };

  const updateContact = (id: string, updates: Partial<ContactChannel>) => {
    persist({
      ...config,
      contacts: config.contacts.map(c => (c.id === id ? { ...c, ...updates } : c)),
    });
  };

  const addContact = (contact: ContactChannel) => {
    persist({ ...config, contacts: [...config.contacts, contact] });
  };

  const removeContact = (id: string) => {
    persist({ ...config, contacts: config.contacts.filter(c => c.id !== id) });
  };

  const updateFAQ = (id: string, updates: Partial<FAQItem>) => {
    persist({
      ...config,
      faq: config.faq.map(f => (f.id === id ? { ...f, ...updates } : f)),
    });
  };

  const addFAQ = (item: Omit<FAQItem, 'id'>) => {
    const newItem: FAQItem = {
      ...item,
      id: `faq-${Date.now()}`,
      ordre: config.faq.length + 1,
    };
    persist({ ...config, faq: [...config.faq, newItem] });
  };

  const removeFAQ = (id: string) => {
    persist({ ...config, faq: config.faq.filter(f => f.id !== id) });
  };

  const reorderFAQ = (id: string, direction: 'up' | 'down') => {
    const sorted = [...config.faq].sort((a, b) => a.ordre - b.ordre);
    const idx = sorted.findIndex(f => f.id === id);
    if (direction === 'up' && idx > 0) {
      [sorted[idx].ordre, sorted[idx - 1].ordre] = [sorted[idx - 1].ordre, sorted[idx].ordre];
    } else if (direction === 'down' && idx < sorted.length - 1) {
      [sorted[idx].ordre, sorted[idx + 1].ordre] = [sorted[idx + 1].ordre, sorted[idx].ordre];
    }
    persist({ ...config, faq: sorted });
  };

  const updatePointPhysique = (updates: Partial<PointPhysique>) => {
    persist({ ...config, pointPhysique: { ...config.pointPhysique, ...updates } });
  };

  const resetToDefault = () => {
    persist(DEFAULT_CONFIG);
  };

  return (
    <SupportConfigContext.Provider
      value={{
        config,
        updateConfig,
        updateContact,
        addContact,
        removeContact,
        updateFAQ,
        addFAQ,
        removeFAQ,
        reorderFAQ,
        updatePointPhysique,
        resetToDefault,
        isSaving,
      }}
    >
      {children}
    </SupportConfigContext.Provider>
  );
}

export function useSupportConfig() {
  const ctx = useContext(SupportConfigContext);
  if (!ctx) throw new Error('useSupportConfig must be used inside SupportConfigProvider');
  return ctx;
}
