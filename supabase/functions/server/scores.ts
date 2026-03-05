/**
 * Routes Scores - JÙLABA
 * Gestion des scores utilisateurs
 */

import { Context } from "npm:hono";
import { checkAuth, sharedSupabase as supabase } from "./auth-helper.ts";

/**
 * GET /api/scores/:userId - Voir le score d'un utilisateur
 */
export async function getScore(c: Context) {
  const auth = await checkAuth(c);
  if (!auth.authorized) {
    return c.json({ error: auth.error }, 401);
  }

  try {
    const userId = c.req.param('userId');

    let { data: score, error } = await supabase
      .from('scores')
      .select('*')
      .eq('user_id', userId)
      .single();

    // Si le score n'existe pas, le créer
    if (error || !score) {
      const { data: newScore, error: createError } = await supabase
        .from('scores')
        .insert({
          user_id: userId,
          score_total: 0,
          score_fiabilite: 0,
          score_qualite: 0,
          score_ponctualite: 0,
          nb_transactions: 0,
          nb_avis: 0,
        })
        .select()
        .single();

      if (createError) {
        console.log('Error creating score:', createError);
        return c.json({ error: 'Erreur lors de la création' }, 500);
      }

      score = newScore;
    }

    return c.json({ score });
  } catch (error) {
    console.log('Error in getScore:', error);
    return c.json({ error: 'Erreur serveur' }, 500);
  }
}

/**
 * PATCH /api/scores/:userId - Mettre à jour le score
 */
export async function updateScore(c: Context) {
  const auth = await checkAuth(c);
  if (!auth.authorized) {
    return c.json({ error: auth.error }, 401);
  }

  try {
    const userId = c.req.param('userId');
    const body = await c.req.json();

    // Seul l'utilisateur lui-même peut modifier son score (ou admin)
    const isAdmin = ['super_admin', 'admin_national'].includes(auth.user.role);
    if (userId !== auth.user.id && !isAdmin) {
      return c.json({ error: 'Non autorisé' }, 403);
    }

    const { data: score, error } = await supabase
      .from('scores')
      .update(body)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      console.log('Error updating score:', error);
      return c.json({ error: 'Erreur lors de la mise à jour' }, 500);
    }

    return c.json({ score });
  } catch (error) {
    console.log('Error in updateScore:', error);
    return c.json({ error: 'Erreur serveur' }, 500);
  }
}

// Exports avec noms attendus
export const getScores = getScore;

/**
 * GET /api/scores/history/:userId - Historique du score
 */
export async function getScoreHistory(c: Context) {
  const auth = await checkAuth(c);
  if (!auth.authorized) {
    return c.json({ error: auth.error }, 401);
  }

  try {
    const userId = c.req.param('userId');

    const { data: history, error } = await supabase
      .from('score_history')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) {
      console.log('Error fetching score history:', error);
      return c.json({ error: 'Erreur lors du chargement' }, 500);
    }

    return c.json({ history: history || [] });
  } catch (error) {
    console.log('Error in getScoreHistory:', error);
    return c.json({ error: 'Erreur serveur' }, 500);
  }
}