/**
 * Routes Missions - JÙLABA
 * Gestion des missions identificateurs
 */

import { Context } from "npm:hono";
import { checkAuth, sharedSupabase as supabase } from "./auth-helper.ts";

/**
 * GET /api/missions - Liste des missions
 */
export async function getMissions(c: Context) {
  const auth = await checkAuth(c);
  if (!auth.authorized) {
    return c.json({ error: auth.error }, 401);
  }

  try {
    const { data: missions, error } = await supabase
      .from('missions')
      .select('*')
      .eq('identificateur_id', auth.user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.log('Error fetching missions:', error);
      return c.json({ error: 'Erreur lors du chargement' }, 500);
    }

    return c.json({ missions: missions || [] });
  } catch (error) {
    console.log('Error in getMissions:', error);
    return c.json({ error: 'Erreur serveur' }, 500);
  }
}

/**
 * PATCH /api/missions/:id/progres - Mettre à jour le progrès
 */
export async function updateMissionProgres(c: Context) {
  const auth = await checkAuth(c);
  if (!auth.authorized) {
    return c.json({ error: auth.error }, 401);
  }

  try {
    const missionId = c.req.param('id');
    const body = await c.req.json();
    const { progres } = body;

    if (progres === undefined) {
      return c.json({ error: 'Progrès requis' }, 400);
    }

    const { data: existing, error: fetchError } = await supabase
      .from('missions')
      .select('*')
      .eq('id', missionId)
      .single();

    if (fetchError || !existing) {
      return c.json({ error: 'Mission introuvable' }, 404);
    }

    if (existing.identificateur_id !== auth.user.id) {
      return c.json({ error: 'Non autorisé' }, 403);
    }

    // Vérifier si mission terminée
    const isTerminee = progres >= (existing.objectif || 100);
    
    const { data: mission, error } = await supabase
      .from('missions')
      .update({ 
        progres: parseInt(progres),
        statut: isTerminee ? 'terminee' : 'en_cours'
      })
      .eq('id', missionId)
      .select()
      .single();

    if (error) {
      console.log('Error updating mission:', error);
      return c.json({ error: 'Erreur lors de la mise à jour' }, 500);
    }

    return c.json({ mission });
  } catch (error) {
    console.log('Error in updateMissionProgres:', error);
    return c.json({ error: 'Erreur serveur' }, 500);
  }
}

export const updateMission = updateMissionProgres;

/**
 * POST /api/missions - Créer une mission
 */
export async function createMission(c: Context) {
  const auth = await checkAuth(c);
  if (!auth.authorized) {
    return c.json({ error: auth.error }, 401);
  }

  try {
    const body = await c.req.json();
    const { titre, description, objectif, recompense } = body;

    const { data: mission, error } = await supabase
      .from('missions')
      .insert({
        identificateur_id: auth.user.id,
        titre,
        description,
        objectif: objectif || 100,
        recompense: recompense || 0,
        progres: 0,
        statut: 'en_cours',
      })
      .select()
      .single();

    if (error) {
      console.log('Error creating mission:', error);
      return c.json({ error: 'Erreur lors de la création' }, 500);
    }

    return c.json({ mission }, 201);
  } catch (error) {
    console.log('Error in createMission:', error);
    return c.json({ error: 'Erreur serveur' }, 500);
  }
}

/**
 * DELETE /api/missions/:id - Supprimer une mission
 */
export async function deleteMission(c: Context) {
  const auth = await checkAuth(c);
  if (!auth.authorized) {
    return c.json({ error: auth.error }, 401);
  }

  try {
    const missionId = c.req.param('id');

    const { data: existing, error: fetchError } = await supabase
      .from('missions')
      .select('*')
      .eq('id', missionId)
      .single();

    if (fetchError || !existing) {
      return c.json({ error: 'Mission introuvable' }, 404);
    }

    if (existing.identificateur_id !== auth.user.id) {
      return c.json({ error: 'Non autorisé' }, 403);
    }

    const { error } = await supabase
      .from('missions')
      .delete()
      .eq('id', missionId);

    if (error) {
      console.log('Error deleting mission:', error);
      return c.json({ error: 'Erreur lors de la suppression' }, 500);
    }

    return c.json({ success: true });
  } catch (error) {
    console.log('Error in deleteMission:', error);
    return c.json({ error: 'Erreur serveur' }, 500);
  }
}