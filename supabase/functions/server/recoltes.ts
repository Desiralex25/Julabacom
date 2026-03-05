/**
 * Routes Récoltes - JÙLABA
 * Gestion des récoltes producteurs
 */

import { Context } from "npm:hono";
import { checkAuth, sharedSupabase as supabase } from "./auth-helper.ts";

/**
 * GET /api/recoltes - Liste des récoltes
 */
export async function getRecoltes(c: Context) {
  const auth = await checkAuth(c);
  if (!auth.authorized) {
    return c.json({ error: auth.error }, 401);
  }

  try {
    const { data: recoltes, error } = await supabase
      .from('recoltes')
      .select('*')
      .eq('producteur_id', auth.user.id)
      .order('date_recolte', { ascending: false });

    if (error) {
      console.log('Error fetching recoltes:', error);
      return c.json({ error: 'Erreur lors du chargement des récoltes' }, 500);
    }

    return c.json({ recoltes: recoltes || [] });
  } catch (error) {
    console.log('Error in getRecoltes:', error);
    return c.json({ error: 'Erreur serveur' }, 500);
  }
}

/**
 * POST /api/recoltes - Déclarer une récolte
 */
export async function createRecolte(c: Context) {
  const auth = await checkAuth(c);
  if (!auth.authorized) {
    return c.json({ error: auth.error }, 401);
  }

  try {
    const body = await c.req.json();
    const { produit, quantite, unite, qualite, prix_unitaire, date_recolte, parcelle, notes } = body;

    if (!produit || !quantite || !unite || !prix_unitaire || !date_recolte) {
      return c.json({ error: 'Champs obligatoires manquants' }, 400);
    }

    const recolteData = {
      producteur_id: auth.user.id,
      produit,
      quantite: parseFloat(quantite),
      unite,
      qualite: qualite || 'standard',
      prix_unitaire: parseFloat(prix_unitaire),
      statut: 'declaree',
      date_recolte,
      parcelle,
      notes,
    };

    const { data: recolte, error } = await supabase
      .from('recoltes')
      .insert(recolteData)
      .select()
      .single();

    if (error) {
      console.log('Error creating recolte:', error);
      return c.json({ error: 'Erreur lors de la déclaration' }, 500);
    }

    await supabase.from('audit_logs').insert({
      user_id: auth.user.id,
      role: auth.user.role,
      action: 'CREATE_RECOLTE',
      description: `Récolte déclarée: ${produit} (${quantite} ${unite})`,
      severity: 'info',
      entity_type: 'recolte',
      entity_id: recolte.id,
    });

    return c.json({ recolte }, 201);
  } catch (error) {
    console.log('Error in createRecolte:', error);
    return c.json({ error: 'Erreur serveur' }, 500);
  }
}

/**
 * PATCH /api/recoltes/:id - Modifier une récolte
 */
export async function updateRecolte(c: Context) {
  const auth = await checkAuth(c);
  if (!auth.authorized) {
    return c.json({ error: auth.error }, 401);
  }

  try {
    const recolteId = c.req.param('id');
    const body = await c.req.json();

    const { data: existingRecolte, error: fetchError } = await supabase
      .from('recoltes')
      .select('*')
      .eq('id', recolteId)
      .single();

    if (fetchError || !existingRecolte) {
      return c.json({ error: 'Récolte introuvable' }, 404);
    }

    if (existingRecolte.producteur_id !== auth.user.id) {
      return c.json({ error: 'Non autorisé' }, 403);
    }

    const { data: recolte, error } = await supabase
      .from('recoltes')
      .update(body)
      .eq('id', recolteId)
      .select()
      .single();

    if (error) {
      console.log('Error updating recolte:', error);
      return c.json({ error: 'Erreur lors de la mise à jour' }, 500);
    }

    await supabase.from('audit_logs').insert({
      user_id: auth.user.id,
      role: auth.user.role,
      action: 'UPDATE_RECOLTE',
      description: `Récolte modifiée: ${recolteId}`,
      severity: 'info',
      entity_type: 'recolte',
      entity_id: recolteId,
    });

    return c.json({ recolte });
  } catch (error) {
    console.log('Error in updateRecolte:', error);
    return c.json({ error: 'Erreur serveur' }, 500);
  }
}

/**
 * DELETE /api/recoltes/:id - Supprimer une récolte
 */
export async function deleteRecolte(c: Context) {
  const auth = await checkAuth(c);
  if (!auth.authorized) {
    return c.json({ error: auth.error }, 401);
  }

  try {
    const recolteId = c.req.param('id');

    const { data: existingRecolte, error: fetchError } = await supabase
      .from('recoltes')
      .select('*')
      .eq('id', recolteId)
      .single();

    if (fetchError || !existingRecolte) {
      return c.json({ error: 'Récolte introuvable' }, 404);
    }

    if (existingRecolte.producteur_id !== auth.user.id) {
      return c.json({ error: 'Non autorisé' }, 403);
    }

    // Supprimer uniquement si statut = declaree
    if (existingRecolte.statut !== 'declaree') {
      return c.json({ error: 'Impossible de supprimer une récolte validée ou vendue' }, 400);
    }

    const { error } = await supabase
      .from('recoltes')
      .delete()
      .eq('id', recolteId);

    if (error) {
      console.log('Error deleting recolte:', error);
      return c.json({ error: 'Erreur lors de la suppression' }, 500);
    }

    await supabase.from('audit_logs').insert({
      user_id: auth.user.id,
      role: auth.user.role,
      action: 'DELETE_RECOLTE',
      description: `Récolte supprimée: ${recolteId}`,
      severity: 'warning',
      entity_type: 'recolte',
      entity_id: recolteId,
    });

    return c.json({ success: true });
  } catch (error) {
    console.log('Error in deleteRecolte:', error);
    return c.json({ error: 'Erreur serveur' }, 500);
  }
}