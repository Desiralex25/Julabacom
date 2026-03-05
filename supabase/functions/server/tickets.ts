/**
 * Routes Tickets Support - JÙLABA
 */

import { Context } from "npm:hono";
import { checkAuth, sharedSupabase as supabase } from "./auth-helper.ts";

/**
 * GET /api/tickets - Liste des tickets
 */
export async function getTickets(c: Context) {
  const auth = await checkAuth(c);
  if (!auth.authorized) {
    return c.json({ error: auth.error }, 401);
  }

  try {
    const { data: tickets, error } = await supabase
      .from('tickets_support')
      .select('*')
      .eq('user_id', auth.user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.log('Error fetching tickets:', error);
      return c.json({ error: 'Erreur lors du chargement' }, 500);
    }

    return c.json({ tickets: tickets || [] });
  } catch (error) {
    console.log('Error in getTickets:', error);
    return c.json({ error: 'Erreur serveur' }, 500);
  }
}

/**
 * POST /api/tickets - Créer un ticket
 */
export async function createTicket(c: Context) {
  const auth = await checkAuth(c);
  if (!auth.authorized) {
    return c.json({ error: auth.error }, 401);
  }

  try {
    const body = await c.req.json();
    const { titre, description, categorie, priorite } = body;

    if (!titre || !description) {
      return c.json({ error: 'Titre et description requis' }, 400);
    }

    const { data: ticket, error } = await supabase
      .from('tickets_support')
      .insert({
        user_id: auth.user.id,
        titre,
        description,
        categorie: categorie || 'autre',
        priorite: priorite || 'moyenne',
        statut: 'ouvert',
        reponses: [],
      })
      .select()
      .single();

    if (error) {
      console.log('Error creating ticket:', error);
      return c.json({ error: 'Erreur lors de la création' }, 500);
    }

    await supabase.from('audit_logs').insert({
      user_id: auth.user.id,
      role: auth.user.role,
      action: 'CREATE_TICKET',
      description: `Ticket créé: ${titre}`,
      severity: 'info',
      entity_type: 'ticket',
      entity_id: ticket.id,
    });

    return c.json({ ticket }, 201);
  } catch (error) {
    console.log('Error in createTicket:', error);
    return c.json({ error: 'Erreur serveur' }, 500);
  }
}

/**
 * PATCH /api/tickets/:id - Répondre/Modifier un ticket
 */
export async function updateTicket(c: Context) {
  const auth = await checkAuth(c);
  if (!auth.authorized) {
    return c.json({ error: auth.error }, 401);
  }

  try {
    const ticketId = c.req.param('id');
    const body = await c.req.json();

    const { data: existing, error: fetchError } = await supabase
      .from('tickets_support')
      .select('*')
      .eq('id', ticketId)
      .single();

    if (fetchError || !existing) {
      return c.json({ error: 'Ticket introuvable' }, 404);
    }

    if (existing.user_id !== auth.user.id) {
      return c.json({ error: 'Non autorisé' }, 403);
    }

    const { data: ticket, error } = await supabase
      .from('tickets_support')
      .update(body)
      .eq('id', ticketId)
      .select()
      .single();

    if (error) {
      console.log('Error updating ticket:', error);
      return c.json({ error: 'Erreur lors de la mise à jour' }, 500);
    }

    return c.json({ ticket });
  } catch (error) {
    console.log('Error in updateTicket:', error);
    return c.json({ error: 'Erreur serveur' }, 500);
  }
}