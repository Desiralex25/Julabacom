/**
 * Routes Academy - JÙLABA
 * Gestion de la progression academy
 */

import { Context } from "npm:hono";
import { checkAuth, sharedSupabase as supabase } from "./auth-helper.ts";

/**
 * GET /api/academy/progress - Progression de l'utilisateur
 */
export async function getAcademyProgress(c: Context) {
  const auth = await checkAuth(c);
  if (!auth.authorized) {
    return c.json({ error: auth.error }, 401);
  }

  try {
    const { data: progress, error } = await supabase
      .from('academy_progress')
      .select('*')
      .eq('user_id', auth.user.id);

    if (error) {
      console.log('Error fetching academy progress:', error);
      return c.json({ error: 'Erreur lors du chargement' }, 500);
    }

    return c.json({ progress: progress || [] });
  } catch (error) {
    console.log('Error in getAcademyProgress:', error);
    return c.json({ error: 'Erreur serveur' }, 500);
  }
}

/**
 * PATCH /api/academy/:moduleId - Mettre à jour la progression d'un module
 */
export async function updateModuleProgress(c: Context) {
  const auth = await checkAuth(c);
  if (!auth.authorized) {
    return c.json({ error: auth.error }, 401);
  }

  try {
    const moduleId = c.req.param('moduleId');
    const body = await c.req.json();
    const { progres, complete, score } = body;

    // Vérifier si l'entrée existe
    const { data: existing } = await supabase
      .from('academy_progress')
      .select('*')
      .eq('user_id', auth.user.id)
      .eq('module_id', moduleId)
      .single();

    let progress;
    
    if (existing) {
      // Mettre à jour
      const { data, error } = await supabase
        .from('academy_progress')
        .update({ 
          progres: progres !== undefined ? parseInt(progres) : existing.progres,
          complete: complete !== undefined ? complete : existing.complete,
          score: score !== undefined ? parseInt(score) : existing.score,
        })
        .eq('id', existing.id)
        .select()
        .single();

      if (error) throw error;
      progress = data;
    } else {
      // Créer
      const { data, error } = await supabase
        .from('academy_progress')
        .insert({
          user_id: auth.user.id,
          module_id: moduleId,
          progres: progres !== undefined ? parseInt(progres) : 0,
          complete: complete || false,
          score: score !== undefined ? parseInt(score) : null,
        })
        .select()
        .single();

      if (error) throw error;
      progress = data;
    }

    return c.json({ progress });
  } catch (error) {
    console.log('Error in updateModuleProgress:', error);
    return c.json({ error: 'Erreur serveur' }, 500);
  }
}