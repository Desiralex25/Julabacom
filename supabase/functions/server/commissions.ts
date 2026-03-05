/**
 * Routes Commissions - JÙLABA
 * Gestion des commissions identificateurs
 */

import { Context } from "npm:hono";
import { checkAuth, sharedSupabase as supabase } from "./auth-helper.ts";

/**
 * GET /api/commissions - Liste des commissions
 */
export async function getCommissions(c: Context) {
  const auth = await checkAuth(c);
  if (!auth.authorized) {
    return c.json({ error: auth.error }, 401);
  }

  try {
    const { data: commissions, error } = await supabase
      .from('commissions')
      .select('*')
      .eq('identificateur_id', auth.user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.log('Error fetching commissions:', error);
      return c.json({ error: 'Erreur lors du chargement' }, 500);
    }

    return c.json({ commissions: commissions || [] });
  } catch (error) {
    console.log('Error in getCommissions:', error);
    return c.json({ error: 'Erreur serveur' }, 500);
  }
}

/**
 * GET /api/commissions/stats - Statistiques des commissions
 */
export async function getCommissionsStats(c: Context) {
  const auth = await checkAuth(c);
  if (!auth.authorized) {
    return c.json({ error: auth.error }, 401);
  }

  try {
    const { data: commissions, error } = await supabase
      .from('commissions')
      .select('*')
      .eq('identificateur_id', auth.user.id);

    if (error) {
      console.log('Error fetching commissions stats:', error);
      return c.json({ error: 'Erreur lors du chargement' }, 500);
    }

    const stats = {
      total: commissions.length,
      en_attente: commissions.filter(c => c.statut === 'en_attente').length,
      validees: commissions.filter(c => c.statut === 'validee').length,
      payees: commissions.filter(c => c.statut === 'payee').length,
      montant_total: commissions.reduce((sum, c) => sum + parseFloat(c.montant || 0), 0),
      montant_paye: commissions.filter(c => c.statut === 'payee').reduce((sum, c) => sum + parseFloat(c.montant || 0), 0),
      montant_en_attente: commissions.filter(c => c.statut === 'en_attente').reduce((sum, c) => sum + parseFloat(c.montant || 0), 0),
    };

    return c.json({ stats });
  } catch (error) {
    console.log('Error in getCommissionsStats:', error);
    return c.json({ error: 'Erreur serveur' }, 500);
  }
}

/**
 * POST /api/commissions - Créer une commission
 */
export async function createCommission(c: Context) {
  return c.json({ error: 'Non implémenté' }, 501);
}

/**
 * PATCH /api/commissions/:id - Modifier une commission
 */
export async function updateCommission(c: Context) {
  return c.json({ error: 'Non implémenté' }, 501);
}