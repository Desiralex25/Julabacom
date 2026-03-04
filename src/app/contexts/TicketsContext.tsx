/**
 * TicketsContext — Gestion centralisée des tickets support.
 *
 * Partagé entre :
 * - Back-Office (BOSupport, BOLayout notifications)
 * - Profils utilisateurs (SupportContact → suivi + lecture réponses BO)
 *
 * Persisté en localStorage. Simule le temps réel par polling.
 */

import React, {
  createContext, useContext, useState, useEffect, useCallback, useRef,
} from 'react';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface TicketMessage {
  id: string;
  auteur: 'user' | 'bo';
  auteurNom: string;
  texte: string;
  date: string;     // ISO string
  lu: boolean;      // lu par le destinataire
}

export type TicketStatut = 'nouveau' | 'en_cours' | 'resolu' | 'ferme';

export interface Ticket {
  id: string;
  numero: string;           // JLB-XXXXXX
  sujet: string;
  role: string;             // profil de l'utilisateur
  statut: TicketStatut;
  dateCreation: string;     // ISO string
  dateMaj: string;          // ISO string
  messages: TicketMessage[];
  luParBO: boolean;         // BO a lu le dernier message user
  luParUser: boolean;       // User a lu la dernière réponse BO
}

// ─── Données initiales ────────────────────────────────────────────────────────

const TICKETS_DEFAUT: Ticket[] = [
  {
    id: '1',
    numero: 'JLB-847392',
    sujet: 'Problème de connexion',
    role: 'Marchand',
    statut: 'nouveau',
    dateCreation: new Date(Date.now() - 2 * 3600000).toISOString(),
    dateMaj: new Date(Date.now() - 2 * 3600000).toISOString(),
    luParBO: false,
    luParUser: true,
    messages: [
      {
        id: 'm1', auteur: 'user', auteurNom: 'Konan Adjoua',
        texte: "Bonjour, je n'arrive plus à accéder à mon compte depuis hier matin. J'ai essayé de réinitialiser mon mot de passe mais je ne reçois pas le SMS.",
        date: new Date(Date.now() - 2 * 3600000).toISOString(), lu: false,
      },
    ],
  },
  {
    id: '2',
    numero: 'JLB-213847',
    sujet: 'Erreur de solde',
    role: 'Producteur',
    statut: 'en_cours',
    dateCreation: new Date(Date.now() - 26 * 3600000).toISOString(),
    dateMaj: new Date(Date.now() - 1 * 3600000).toISOString(),
    luParBO: true,
    luParUser: false,
    messages: [
      {
        id: 'm2', auteur: 'user', auteurNom: 'Touré Bakary',
        texte: 'Mon solde affiche un montant négatif alors que je n\'ai pas fait de transaction suspecte.',
        date: new Date(Date.now() - 26 * 3600000).toISOString(), lu: true,
      },
      {
        id: 'm3', auteur: 'bo', auteurNom: 'Support JÙLABA',
        texte: 'Bonjour Bakary, nous avons bien reçu votre demande. Notre équipe technique a identifié le problème. Votre solde sera corrigé sous 2h. Merci pour votre patience.',
        date: new Date(Date.now() - 1 * 3600000).toISOString(), lu: false,
      },
    ],
  },
  {
    id: '3',
    numero: 'JLB-991023',
    sujet: 'Application lente',
    role: 'Coopérative',
    statut: 'resolu',
    dateCreation: new Date(Date.now() - 72 * 3600000).toISOString(),
    dateMaj: new Date(Date.now() - 48 * 3600000).toISOString(),
    luParBO: true,
    luParUser: true,
    messages: [
      {
        id: 'm4', auteur: 'user', auteurNom: 'Coop Bongouanou',
        texte: "L'application est très lente depuis la dernière mise à jour, surtout pour accéder à la liste des membres.",
        date: new Date(Date.now() - 72 * 3600000).toISOString(), lu: true,
      },
      {
        id: 'm5', auteur: 'bo', auteurNom: 'Support JÙLABA',
        texte: 'Merci pour votre signalement. Nous avons optimisé le chargement de la liste des membres. Veuillez relancer l\'application et nous dire si le problème persiste.',
        date: new Date(Date.now() - 48 * 3600000).toISOString(), lu: true,
      },
    ],
  },
  {
    id: '4',
    numero: 'JLB-556781',
    sujet: 'Données incorrectes',
    role: 'Producteur',
    statut: 'nouveau',
    dateCreation: new Date(Date.now() - 30 * 60000).toISOString(),
    dateMaj: new Date(Date.now() - 30 * 60000).toISOString(),
    luParBO: false,
    luParUser: true,
    messages: [
      {
        id: 'm6', auteur: 'user', auteurNom: 'Diallo Mariama',
        texte: 'Mon nom est mal orthographié dans le système. Mon nom correct est Diallo Mariama et non Dialo Mariama.',
        date: new Date(Date.now() - 30 * 60000).toISOString(), lu: false,
      },
    ],
  },
  {
    id: '5',
    numero: 'JLB-334512',
    sujet: 'Transaction incorrecte',
    role: 'Marchand',
    statut: 'en_cours',
    dateCreation: new Date(Date.now() - 20 * 3600000).toISOString(),
    dateMaj: new Date(Date.now() - 5 * 3600000).toISOString(),
    luParBO: true,
    luParUser: true,
    messages: [
      {
        id: 'm7', auteur: 'user', auteurNom: 'Yao Koffi',
        texte: "Une transaction de 25 000 FCFA n'apparaît pas dans mon historique mais l'argent a bien été débité.",
        date: new Date(Date.now() - 20 * 3600000).toISOString(), lu: true,
      },
      {
        id: 'm8', auteur: 'bo', auteurNom: 'Support JÙLABA',
        texte: 'Bonjour Yao, nous analysons votre transaction. Pouvez-vous nous donner la date et l\'heure approximative de cette transaction ?',
        date: new Date(Date.now() - 5 * 3600000).toISOString(), lu: true,
      },
    ],
  },
];

// ─── Contexte ─────────────────────────────────────────────────────────────────

interface TicketsCtx {
  tickets: Ticket[];
  // Métriques
  nouveauxCount: number;          // tickets non lus par BO (statut nouveau)
  reponsesNonLues: number;        // réponses BO non lues par user
  // Actions BO
  creerTicketDemo: () => void;    // simule l'arrivée d'un nouveau ticket
  changerStatut: (id: string, statut: TicketStatut) => void;
  envoyerReponseBO: (id: string, texte: string, auteurNom: string) => void;
  marquerLuParBO: (id: string) => void;
  // Actions User
  creerTicket: (sujet: string, message: string, role: string, auteurNom: string) => string;
  marquerLuParUser: (numero: string) => void;
  getTicketByNumero: (numero: string) => Ticket | undefined;
}

const Ctx = createContext<TicketsCtx | null>(null);

export function useTickets() {
  const c = useContext(Ctx);
  if (!c) throw new Error('useTickets doit être dans <TicketsProvider>');
  return c;
}

// ─── Provider ─────────────────────────────────────────────────────────────────

const LS_KEY = 'julaba_tickets_v2';

function loadFromLS(): Ticket[] {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (raw) return JSON.parse(raw) as Ticket[];
  } catch {}
  return TICKETS_DEFAUT;
}

function saveToLS(tickets: Ticket[]) {
  try { localStorage.setItem(LS_KEY, JSON.stringify(tickets)); } catch {}
}

// Noms de démo pour les tickets simulés
const DEMO_USERS = [
  { nom: 'Kouassi Ama', role: 'Marchand', sujet: 'Impossible de valider une vente' },
  { nom: 'Traoré Mamadou', role: 'Producteur', sujet: 'Récolte non enregistrée' },
  { nom: 'Coop Tiassalé', role: 'Coopérative', sujet: 'Stock incorrect affiché' },
  { nom: 'Bamba Fatoumata', role: 'Marchand', sujet: 'Code QR non reconnu' },
  { nom: 'Yeboah Kwame', role: 'Producteur', sujet: 'Paiement non reçu' },
];

export function TicketsProvider({ children }: { children: React.ReactNode }) {
  const [tickets, setTickets] = useState<Ticket[]>(loadFromLS);
  const demoIdx = useRef(0);

  // Persister dès que tickets change
  useEffect(() => { saveToLS(tickets); }, [tickets]);

  // ── Métriques ─────────────────────────────────────────────────────────────
  const nouveauxCount = tickets.filter(
    t => !t.luParBO && t.statut !== 'ferme'
  ).length;

  const reponsesNonLues = tickets.filter(
    t => !t.luParUser && t.messages.some(m => m.auteur === 'bo' && !m.lu)
  ).length;

  // ── Actions BO ────────────────────────────────────────────────────────────

  const creerTicketDemo = useCallback(() => {
    const demo = DEMO_USERS[demoIdx.current % DEMO_USERS.length];
    demoIdx.current++;
    const now = new Date().toISOString();
    const numero = `JLB-${Date.now().toString().slice(-6)}`;
    const t: Ticket = {
      id: `demo-${Date.now()}`,
      numero,
      sujet: demo.sujet,
      role: demo.role,
      statut: 'nouveau',
      dateCreation: now,
      dateMaj: now,
      luParBO: false,
      luParUser: true,
      messages: [
        {
          id: `dm-${Date.now()}`,
          auteur: 'user',
          auteurNom: demo.nom,
          texte: `Bonjour, j'ai un problème : ${demo.sujet.toLowerCase()}. Merci de m'aider au plus vite.`,
          date: now,
          lu: false,
        },
      ],
    };
    setTickets(ts => [t, ...ts]);
  }, []);

  const changerStatut = useCallback((id: string, statut: TicketStatut) => {
    setTickets(ts => ts.map(t =>
      t.id === id
        ? { ...t, statut, dateMaj: new Date().toISOString() }
        : t
    ));
  }, []);

  const envoyerReponseBO = useCallback((id: string, texte: string, auteurNom: string) => {
    const msg: TicketMessage = {
      id: `bo-${Date.now()}`,
      auteur: 'bo',
      auteurNom,
      texte,
      date: new Date().toISOString(),
      lu: false,
    };
    setTickets(ts => ts.map(t =>
      t.id === id
        ? {
            ...t,
            statut: t.statut === 'nouveau' ? 'en_cours' : t.statut,
            dateMaj: new Date().toISOString(),
            luParBO: true,
            luParUser: false,
            messages: [...t.messages, msg],
          }
        : t
    ));
  }, []);

  const marquerLuParBO = useCallback((id: string) => {
    setTickets(ts => ts.map(t =>
      t.id === id
        ? {
            ...t,
            luParBO: true,
            messages: t.messages.map(m => m.auteur === 'user' ? { ...m, lu: true } : m),
          }
        : t
    ));
  }, []);

  // ── Actions User ──────────────────────────────────────────────────────────

  const creerTicket = useCallback((
    sujet: string,
    message: string,
    role: string,
    auteurNom: string,
  ): string => {
    const now = new Date().toISOString();
    const numero = `JLB-${Date.now().toString().slice(-6)}`;
    const t: Ticket = {
      id: `user-${Date.now()}`,
      numero,
      sujet,
      role,
      statut: 'nouveau',
      dateCreation: now,
      dateMaj: now,
      luParBO: false,
      luParUser: true,
      messages: [
        {
          id: `um-${Date.now()}`,
          auteur: 'user',
          auteurNom,
          texte: message,
          date: now,
          lu: false,
        },
      ],
    };
    setTickets(ts => [t, ...ts]);
    return numero;
  }, []);

  const marquerLuParUser = useCallback((numero: string) => {
    setTickets(ts => ts.map(t =>
      t.numero === numero
        ? {
            ...t,
            luParUser: true,
            messages: t.messages.map(m => m.auteur === 'bo' ? { ...m, lu: true } : m),
          }
        : t
    ));
  }, []);

  const getTicketByNumero = useCallback((numero: string): Ticket | undefined => {
    return tickets.find(t => t.numero.toUpperCase() === numero.toUpperCase());
  }, [tickets]);

  return (
    <Ctx.Provider value={{
      tickets,
      nouveauxCount,
      reponsesNonLues,
      creerTicketDemo,
      changerStatut,
      envoyerReponseBO,
      marquerLuParBO,
      creerTicket,
      marquerLuParUser,
      getTicketByNumero,
    }}>
      {children}
    </Ctx.Provider>
  );
}
