import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import * as ticketsApi from '../../imports/tickets-api';
import { DEV_MODE, devLog } from '../config/devMode';
import { NOT_AUTHENTICATED } from '../../imports/api-client';

export type TicketStatut = 'nouveau' | 'en_cours' | 'resolu' | 'ferme';

export interface Ticket {
  id: string;
  userId: string;
  titre: string;
  description: string;
  categorie: 'technique' | 'paiement' | 'livraison' | 'compte' | 'autre';
  priorite: 'basse' | 'moyenne' | 'haute' | 'critique';
  statut: TicketStatut;
  reponses?: any;
  dateCreation: string;
  luParBO?: boolean;
  // Proprietes additionnelles pour la UI du back-office
  numero?: string;
  sujet?: string;
  role?: string;
  messages?: Array<{ auteurNom: string; texte: string }>;
}

interface TicketsContextType {
  tickets: Ticket[];
  loading: boolean;
  nouveauxCount: number;
  
  createTicket: (data: Omit<Ticket, 'id' | 'statut' | 'dateCreation' | 'userId' | 'reponses'>) => Promise<void>;
  updateTicket: (id: string, data: Partial<Ticket>) => Promise<void>;
  
  getTicketsByStatut: (statut: Ticket['statut']) => Ticket[];
  getTicketsByPriorite: (priorite: Ticket['priorite']) => Ticket[];
  
  creerTicketDemo: () => void;
  marquerLuParBO: (ticketId: string) => Promise<void>;
  changerStatut: (ticketId: string, statut: Ticket['statut']) => Promise<void>;
  
  refreshTickets: () => Promise<void>;
}

const TicketsContext = createContext<TicketsContextType | undefined>(undefined);

export function TicketsProvider({ children }: { children: ReactNode }) {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(false);
  const [nouveauxCount, setNouveauxCount] = useState(0);

  const loadTickets = async () => {
    if (DEV_MODE) {
      devLog('TicketsContext', 'Mode dev - skip API call');
      return;
    }
    try {
      setLoading(true);
      const { tickets: data } = await ticketsApi.fetchTickets();
      
      if (data && Array.isArray(data)) {
        const ticketList: Ticket[] = data.map((t: any) => ({
          id: t.id,
          userId: t.user_id,
          titre: t.titre,
          description: t.description,
          categorie: t.categorie,
          priorite: t.priorite,
          statut: t.statut,
          reponses: t.reponses,
          dateCreation: t.created_at,
          luParBO: t.lu_par_bo,
        }));

        setTickets(ticketList);
        setNouveauxCount(ticketList.filter(t => t.statut === 'nouveau' && !t.luParBO).length);
      } else {
        setTickets([]);
        setNouveauxCount(0);
      }
    } catch (error: any) {
      if (error?.message === NOT_AUTHENTICATED) return;
      if (error?.message === 'Invalid JWT' || error?.message === 'SESSION_EXPIRED' || error?.message === 'AUCUNE_SESSION_BO') {
        // Erreurs d'auth silencieuses - ne pas polluer la console
        setTickets([]);
        setNouveauxCount(0);
        return;
      }
      console.error('Error loading tickets:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTickets();
  }, []);

  const createTicket = async (
    data: Omit<Ticket, 'id' | 'statut' | 'dateCreation' | 'userId' | 'reponses'>
  ) => {
    try {
      await ticketsApi.createTicket({
        titre: data.titre,
        description: data.description,
        categorie: data.categorie,
        priorite: data.priorite,
      });
      await loadTickets();
    } catch (error) {
      console.error('Error creating ticket:', error);
      throw error;
    }
  };

  const updateTicket = async (id: string, data: Partial<Ticket>) => {
    try {
      await ticketsApi.updateTicket(id, {
        statut: data.statut,
        reponses: data.reponses,
      });
      await loadTickets();
    } catch (error) {
      console.error('Error updating ticket:', error);
      throw error;
    }
  };

  const getTicketsByStatut = (statut: Ticket['statut']) => {
    return tickets.filter(t => t.statut === statut);
  };

  const getTicketsByPriorite = (priorite: Ticket['priorite']) => {
    return tickets.filter(t => t.priorite === priorite);
  };

  const refreshTickets = async () => {
    await loadTickets();
  };

  const creerTicketDemo = () => {
    const demoTickets = [
      {
        titre: 'Probleme de connexion',
        description: 'Je ne peux pas me connecter a mon compte marchand.',
        categorie: 'technique' as const,
        priorite: 'haute' as const,
        role: 'Marchand',
        sujet: 'Probleme de connexion au compte',
      },
      {
        titre: 'Question sur un paiement',
        description: 'Mon paiement de 15000 FCFA n\'apparait pas.',
        categorie: 'paiement' as const,
        priorite: 'moyenne' as const,
        role: 'Marchand',
        sujet: 'Paiement non enregistre',
      },
      {
        titre: 'Modification de profil',
        description: 'Comment puis-je modifier mon numero de telephone?',
        categorie: 'compte' as const,
        priorite: 'basse' as const,
        role: 'Producteur',
        sujet: 'Changement de numero de telephone',
      },
    ];
    
    const randomTicket = demoTickets[Math.floor(Math.random() * demoTickets.length)];
    const ticketNumber = `TKT${Date.now().toString().slice(-6)}`;
    
    // Creer un ticket local pour demo (sans appeler l'API)
    const newTicket: Ticket = {
      id: `demo-${Date.now()}`,
      userId: 'demo-user',
      titre: randomTicket.titre,
      description: randomTicket.description,
      categorie: randomTicket.categorie,
      priorite: randomTicket.priorite,
      statut: 'nouveau',
      dateCreation: new Date().toISOString(),
      luParBO: false,
      numero: ticketNumber,
      sujet: randomTicket.sujet,
      role: randomTicket.role,
      messages: [
        {
          auteurNom: 'Utilisateur Demo',
          texte: randomTicket.description,
        },
      ],
    };
    
    setTickets(prev => [newTicket, ...prev]);
    setNouveauxCount(prev => prev + 1);
  };

  const marquerLuParBO = async (ticketId: string) => {
    try {
      await ticketsApi.updateTicket(ticketId, {
        lu_par_bo: true,
      });
      await loadTickets();
    } catch (error) {
      console.error('Error marking ticket as read by BO:', error);
      throw error;
    }
  };

  const changerStatut = async (ticketId: string, statut: Ticket['statut']) => {
    try {
      await ticketsApi.updateTicket(ticketId, {
        statut: statut,
      });
      await loadTickets();
    } catch (error) {
      console.error('Error changing ticket status:', error);
      throw error;
    }
  };

  const value: TicketsContextType = {
    tickets,
    loading,
    nouveauxCount,
    createTicket,
    updateTicket,
    getTicketsByStatut,
    getTicketsByPriorite,
    creerTicketDemo,
    marquerLuParBO,
    changerStatut,
    refreshTickets,
  };

  return <TicketsContext.Provider value={value}>{children}</TicketsContext.Provider>;
}

export function useTickets() {
  const context = useContext(TicketsContext);
  if (!context) {
    throw new Error('useTickets must be used within TicketsProvider');
  }
  return context;
}