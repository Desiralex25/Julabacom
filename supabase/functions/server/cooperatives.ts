/**
 * Routes Coopératives - JÙLABA
 * Gestion des coopératives et membres
 */

import { Context } from "npm:hono";
import { checkAuth, sharedSupabase as supabase } from "./auth-helper.ts";

/**
 * GET /api/cooperatives - Liste des coopératives
 */
export async function getCooperatives(c: Context) {
  const auth = await checkAuth(c);
  if (!auth.authorized) {
    return c.json({ error: auth.error }, 401);
  }

  try {
    const { data: cooperatives, error } = await supabase
      .from('cooperatives')
      .select('*');

    if (error) {
      return c.json({ error: 'Erreur lors du chargement' }, 500);
    }

    return c.json({ cooperatives: cooperatives || [] });
  } catch (error) {
    console.log('Error in getCooperatives:', error);
    return c.json({ error: 'Erreur serveur' }, 500);
  }
}

/**
 * GET /api/cooperative - Profil de la coopérative
 */
export async function getCooperative(c: Context) {
  const auth = await checkAuth(c);
  if (!auth.authorized) {
    return c.json({ error: auth.error }, 401);
  }

  try {
    const { data: cooperative, error } = await supabase
      .from('cooperatives')
      .select('*')
      .eq('user_id', auth.user.id)
      .single();

    if (error || !cooperative) {
      return c.json({ error: 'Coopérative introuvable' }, 404);
    }

    return c.json({ cooperative });
  } catch (error) {
    console.log('Error in getCooperative:', error);
    return c.json({ error: 'Erreur serveur' }, 500);
  }
}

/**
 * GET /api/cooperative/membres - Liste des membres
 */
export async function getCooperativeMembres(c: Context) {
  const auth = await checkAuth(c);
  if (!auth.authorized) {
    return c.json({ error: auth.error }, 401);
  }

  try {
    // Récupérer la coopérative
    const { data: cooperative, error: coopError } = await supabase
      .from('cooperatives')
      .select('id')
      .eq('user_id', auth.user.id)
      .single();

    if (coopError || !cooperative) {
      return c.json({ error: 'Coopérative introuvable' }, 404);
    }

    // Récupérer les membres
    const { data: membres, error } = await supabase
      .from('cooperative_membres')
      .select('*')
      .eq('cooperative_id', cooperative.id)
      .order('date_adhesion', { ascending: false });

    if (error) {
      console.log('Error fetching membres:', error);
      return c.json({ error: 'Erreur lors du chargement' }, 500);
    }

    return c.json({ membres: membres || [] });
  } catch (error) {
    console.log('Error in getCooperativeMembres:', error);
    return c.json({ error: 'Erreur serveur' }, 500);
  }
}

/**
 * GET /api/cooperative/tresorerie - Historique trésorerie
 */
export async function getCooperativeTresorerie(c: Context) {
  const auth = await checkAuth(c);
  if (!auth.authorized) {
    return c.json({ error: auth.error }, 401);
  }

  try {
    // Récupérer la coopérative
    const { data: cooperative, error: coopError } = await supabase
      .from('cooperatives')
      .select('id')
      .eq('user_id', auth.user.id)
      .single();

    if (coopError || !cooperative) {
      return c.json({ error: 'Coopérative introuvable' }, 404);
    }

    // Récupérer les transactions
    const { data: transactions, error } = await supabase
      .from('cooperative_tresorerie')
      .select('*')
      .eq('cooperative_id', cooperative.id)
      .order('created_at', { ascending: false })
      .limit(100);

    if (error) {
      console.log('Error fetching tresorerie:', error);
      return c.json({ error: 'Erreur lors du chargement' }, 500);
    }

    return c.json({ transactions: transactions || [] });
  } catch (error) {
    console.log('Error in getCooperativeTresorerie:', error);
    return c.json({ error: 'Erreur serveur' }, 500);
  }
}

/**
 * POST /api/cooperative/tresorerie - Ajouter une transaction
 */
export async function addTresorerieTransaction(c: Context) {
  const auth = await checkAuth(c);
  if (!auth.authorized) {
    return c.json({ error: auth.error }, 401);
  }

  try {
    const body = await c.req.json();
    const { type, montant, membre_id, description } = body;

    if (!type || !montant) {
      return c.json({ error: 'Champs obligatoires manquants' }, 400);
    }

    // Récupérer la coopérative
    const { data: cooperative, error: coopError } = await supabase
      .from('cooperatives')
      .select('*')
      .eq('user_id', auth.user.id)
      .single();

    if (coopError || !cooperative) {
      return c.json({ error: 'Coopérative introuvable' }, 404);
    }

    // Ajouter la transaction
    const { data: transaction, error } = await supabase
      .from('cooperative_tresorerie')
      .insert({
        cooperative_id: cooperative.id,
        type,
        montant: parseFloat(montant),
        membre_id,
        description,
      })
      .select()
      .single();

    if (error) {
      console.log('Error adding tresorerie transaction:', error);
      return c.json({ error: 'Erreur lors de l\'ajout' }, 500);
    }

    // Mettre à jour le solde de la coopérative
    let nouveauSolde = parseFloat(cooperative.solde_tresorerie);
    
    if (['cotisation', 'vente', 'subvention'].includes(type)) {
      nouveauSolde += parseFloat(montant);
    } else if (['achat', 'depense', 'retrait'].includes(type)) {
      nouveauSolde -= parseFloat(montant);
    }

    await supabase
      .from('cooperatives')
      .update({ solde_tresorerie: nouveauSolde })
      .eq('id', cooperative.id);

    await supabase.from('audit_logs').insert({
      user_id: auth.user.id,
      role: auth.user.role,
      action: 'ADD_TRESORERIE_TRANSACTION',
      description: `Transaction trésorerie: ${type} (${montant} FCFA)`,
      severity: 'info',
      entity_type: 'cooperative_tresorerie',
      entity_id: transaction.id,
    });

    return c.json({ transaction }, 201);
  } catch (error) {
    console.log('Error in addTresorerieTransaction:', error);
    return c.json({ error: 'Erreur serveur' }, 500);
  }
}

/**
 * POST /api/cooperative/membres - Ajouter un membre
 */
export async function addCooperativeMembre(c: Context) {
  const auth = await checkAuth(c);
  if (!auth.authorized) {
    return c.json({ error: auth.error }, 401);
  }

  try {
    const body = await c.req.json();
    const { membre_id, role, date_adhesion, cotisation_payee } = body;

    if (!membre_id || !date_adhesion) {
      return c.json({ error: 'Champs obligatoires manquants' }, 400);
    }

    // Récupérer la coopérative
    const { data: cooperative, error: coopError } = await supabase
      .from('cooperatives')
      .select('id')
      .eq('user_id', auth.user.id)
      .single();

    if (coopError || !cooperative) {
      return c.json({ error: 'Coopérative introuvable' }, 404);
    }

    // Ajouter le membre
    const { data: membre, error } = await supabase
      .from('cooperative_membres')
      .insert({
        cooperative_id: cooperative.id,
        membre_id,
        role: role || 'membre',
        date_adhesion,
        cotisation_payee: cotisation_payee || false,
        actif: true,
      })
      .select()
      .single();

    if (error) {
      console.log('Error adding membre:', error);
      return c.json({ error: 'Erreur lors de l\'ajout' }, 500);
    }

    await supabase.from('audit_logs').insert({
      user_id: auth.user.id,
      role: auth.user.role,
      action: 'ADD_COOPERATIVE_MEMBRE',
      description: `Membre ajouté: ${membre_id}`,
      severity: 'info',
      entity_type: 'cooperative_membre',
      entity_id: membre.id,
    });

    return c.json({ membre }, 201);
  } catch (error) {
    console.log('Error in addCooperativeMembre:', error);
    return c.json({ error: 'Erreur serveur' }, 500);
  }
}

// Exports avec noms attendus
export const getCooperativeById = getCooperative;
export const getMembres = getCooperativeMembres;
export const addMembre = addCooperativeMembre;
export const getTresorerie = getCooperativeTresorerie;

/**
 * POST /api/cooperatives - Créer une coopérative
 */
export async function createCooperative(c: Context) {
  return c.json({ error: 'Non implémenté' }, 501);
}

/**
 * PATCH /api/cooperatives/:id - Modifier une coopérative
 */
export async function updateCooperative(c: Context) {
  return c.json({ error: 'Non implémenté' }, 501);
}

/**
 * DELETE /api/cooperatives/:id/membres/:membreId - Retirer un membre
 */
export async function removeMembre(c: Context) {
  const auth = await checkAuth(c);
  if (!auth.authorized) {
    return c.json({ error: auth.error }, 401);
  }

  try {
    const cooperativeId = c.req.param('id');
    const membreId = c.req.param('membreId');

    const { error } = await supabase
      .from('cooperative_membres')
      .update({ actif: false })
      .eq('id', membreId)
      .eq('cooperative_id', cooperativeId);

    if (error) {
      console.log('Error removing membre:', error);
      return c.json({ error: 'Erreur lors de la suppression' }, 500);
    }

    return c.json({ success: true });
  } catch (error) {
    console.log('Error in removeMembre:', error);
    return c.json({ error: 'Erreur serveur' }, 500);
  }
}