import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import * as ticketsApi from '../../imports/tickets-api';
import { DEV_MODE, devLog } from '../config/devMode';

export interface Ticket {
  id: string;
  userId: string;
  titre: string;
  description: string;
  categorie: 'technique' | 'paiement' | 'livraison' | 'compte' | 'autre';
  priorite: 'basse' | 'moyenne' | 'haute' | 'critique';
  statut: 'ouvert' | 'en_cours' | 'resolu' | 'ferme';
  reponses?: any;
  dateCreation: string;
}

interface TicketsContextType {
  tickets: Ticket[];
  loading: boolean;
  
  createTicket: (data: Omit<Ticket, 'id' | 'statut' | 'dateCreation' | 'userId' | 'reponses'>) => Promise<void>;
  updateTicket: (id: string, data: Partial<Ticket>) => Promise<void>;
  
  getTicketsByStatut: (statut: Ticket['statut']) => Ticket[];
  getTicketsByPriorite: (priorite: Ticket['priorite']) => Ticket[];
  
  refreshTickets: () => Promise<void>;
}

const TicketsContext = createContext<TicketsContextType | undefined>(undefined);

export function TicketsProvider({ children }: { children: ReactNode }) {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(false);

  const loadTickets = async () => {
    if (DEV_MODE) {
      devLog('TicketsContext', 'Mode dev - skip API call');
      return;
    }
    try {
      setLoading(true);
      const { tickets: data } = await ticketsApi.fetchTickets();
      
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
      }));

      setTickets(ticketList);
    } catch (error) {
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

  const value: TicketsContextType = {
    tickets,
    loading,
    createTicket,
    updateTicket,
    getTicketsByStatut,
    getTicketsByPriorite,
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