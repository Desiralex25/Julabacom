/**
 * Routes Commandes - JÙLABA
 * Gestion des commandes achat/vente
 */

import { Context } from "npm:hono";
import { checkAuth, sharedSupabase as supabase } from "./auth-helper.ts";

/**
 * GET /api/commandes - Liste des commandes
 */
export async function getCommandes(c: Context) {
  const auth = await checkAuth(c);
  if (!auth.authorized) {
    return c.json({ error: auth.error }, 401);
  }

  try {
    const { data: commandes, error } = await supabase
      .from('commandes')
      .select('*')
      .or(`user_id.eq.${auth.user.id},acheteur_id.eq.${auth.user.id},vendeur_id.eq.${auth.user.id}`)
      .order('created_at', { ascending: false });

    if (error) {
      console.log('Error fetching commandes:', error);
      return c.json({ error: 'Erreur lors du chargement des commandes' }, 500);
    }

    return c.json({ commandes: commandes || [] });
  } catch (error) {
    console.log('Error in getCommandes:', error);
    return c.json({ error: 'Erreur serveur' }, 500);
  }
}

/**
 * POST /api/commandes - Créer une commande
 */
export async function createCommande(c: Context) {
  const auth = await checkAuth(c);
  if (!auth.authorized) {
    return c.json({ error: auth.error }, 401);
  }

  try {
    const body = await c.req.json();
    const { type, produit, quantite, prix, acheteur_id, vendeur_id, mode_paiement, adresse_livraison, notes } = body;

    // Validation
    if (!type || !produit || !quantite || !prix) {
      return c.json({ error: 'Champs obligatoires manquants' }, 400);
    }

    const total = parseFloat(prix) * parseFloat(quantite);

    const commandeData = {
      user_id: auth.user.id,
      acheteur_id: acheteur_id || (type === 'achat' ? auth.user.id : null),
      vendeur_id: vendeur_id || (type === 'vente' ? auth.user.id : null),
      type,
      statut: 'en_attente',
      produit,
      quantite,
      prix: parseFloat(prix),
      total,
      mode_paiement: mode_paiement || 'wallet',
      date_creation: new Date().toISOString(),
      adresse_livraison,
      notes,
    };

    const { data: commande, error } = await supabase
      .from('commandes')
      .insert(commandeData)
      .select()
      .single();

    if (error) {
      console.log('Error creating commande:', error);
      return c.json({ error: 'Erreur lors de la création de la commande' }, 500);
    }

    // Créer un audit log
    await supabase.from('audit_logs').insert({
      user_id: auth.user.id,
      role: auth.user.role,
      action: 'CREATE_COMMANDE',
      description: `Commande créée: ${produit} (${quantite})`,
      severity: 'info',
      entity_type: 'commande',
      entity_id: commande.id,
    });

    return c.json({ commande }, 201);
  } catch (error) {
    console.log('Error in createCommande:', error);
    return c.json({ error: 'Erreur serveur' }, 500);
  }
}

/**
 * PATCH /api/commandes/:id - Modifier une commande
 */
export async function updateCommande(c: Context) {
  const auth = await checkAuth(c);
  if (!auth.authorized) {
    return c.json({ error: auth.error }, 401);
  }

  try {
    const commandeId = c.req.param('id');
    const body = await c.req.json();

    // Vérifier que la commande appartient à l'utilisateur
    const { data: existingCommande, error: fetchError } = await supabase
      .from('commandes')
      .select('*')
      .eq('id', commandeId)
      .single();

    if (fetchError || !existingCommande) {
      return c.json({ error: 'Commande introuvable' }, 404);
    }

    if (existingCommande.user_id !== auth.user.id) {
      return c.json({ error: 'Non autorisé' }, 403);
    }

    // Mettre à jour
    const { data: commande, error } = await supabase
      .from('commandes')
      .update(body)
      .eq('id', commandeId)
      .select()
      .single();

    if (error) {
      console.log('Error updating commande:', error);
      return c.json({ error: 'Erreur lors de la mise à jour' }, 500);
    }

    // Audit log
    await supabase.from('audit_logs').insert({
      user_id: auth.user.id,
      role: auth.user.role,
      action: 'UPDATE_COMMANDE',
      description: `Commande modifiée: ${commandeId}`,
      severity: 'info',
      entity_type: 'commande',
      entity_id: commandeId,
    });

    return c.json({ commande });
  } catch (error) {
    console.log('Error in updateCommande:', error);
    return c.json({ error: 'Erreur serveur' }, 500);
  }
}

/**
 * DELETE /api/commandes/:id - Annuler une commande
 */
export async function deleteCommande(c: Context) {
  const auth = await checkAuth(c);
  if (!auth.authorized) {
    return c.json({ error: auth.error }, 401);
  }

  try {
    const commandeId = c.req.param('id');

    // Vérifier que la commande appartient à l'utilisateur
    const { data: existingCommande, error: fetchError } = await supabase
      .from('commandes')
      .select('*')
      .eq('id', commandeId)
      .single();

    if (fetchError || !existingCommande) {
      return c.json({ error: 'Commande introuvable' }, 404);
    }

    if (existingCommande.user_id !== auth.user.id) {
      return c.json({ error: 'Non autorisé' }, 403);
    }

    // Mettre à jour le statut à "annulee" au lieu de supprimer
    const { error } = await supabase
      .from('commandes')
      .update({ statut: 'annulee' })
      .eq('id', commandeId);

    if (error) {
      console.log('Error cancelling commande:', error);
      return c.json({ error: 'Erreur lors de l\'annulation' }, 500);
    }

    // Audit log
    await supabase.from('audit_logs').insert({
      user_id: auth.user.id,
      role: auth.user.role,
      action: 'CANCEL_COMMANDE',
      description: `Commande annulée: ${commandeId}`,
      severity: 'warning',
      entity_type: 'commande',
      entity_id: commandeId,
    });

    return c.json({ success: true });
  } catch (error) {
    console.log('Error in deleteCommande:', error);
    return c.json({ error: 'Erreur serveur' }, 500);
  }
}