/**
 * Routes Caisse - JÙLABA
 * Gestion des transactions caisse (marchand)
 */

import { Context } from "npm:hono";
import { checkAuth, sharedSupabase as supabase } from "./auth-helper.ts";

/**
 * GET /api/caisse/transactions - Historique des transactions caisse
 */
export async function getCaisseTransactions(c: Context) {
  const auth = await checkAuth(c);
  if (!auth.authorized) {
    return c.json({ error: auth.error }, 401);
  }

  try {
    const { data: transactions, error } = await supabase
      .from('caisse_transactions')
      .select('*')
      .eq('marchand_id', auth.user.id)
      .order('created_at', { ascending: false })
      .limit(200);

    if (error) {
      console.log('Error fetching caisse transactions:', error);
      return c.json({ error: 'Erreur lors du chargement' }, 500);
    }

    return c.json({ transactions: transactions || [] });
  } catch (error) {
    console.log('Error in getCaisseTransactions:', error);
    return c.json({ error: 'Erreur serveur' }, 500);
  }
}

/**
 * POST /api/caisse/vente - Enregistrer une vente
 */
export async function enregistrerVente(c: Context) {
  const auth = await checkAuth(c);
  if (!auth.authorized) {
    return c.json({ error: auth.error }, 401);
  }

  try {
    const body = await c.req.json();
    const { montant, produits, mode_paiement, notes } = body;

    if (!montant || montant <= 0) {
      return c.json({ error: 'Montant invalide' }, 400);
    }

    const { data: transaction, error } = await supabase
      .from('caisse_transactions')
      .insert({
        marchand_id: auth.user.id,
        type: 'vente',
        montant: parseFloat(montant),
        produits,
        mode_paiement: mode_paiement || 'especes',
        notes,
      })
      .select()
      .single();

    if (error) {
      console.log('Error creating vente:', error);
      return c.json({ error: 'Erreur lors de l\'enregistrement' }, 500);
    }

    await supabase.from('audit_logs').insert({
      user_id: auth.user.id,
      role: auth.user.role,
      action: 'CAISSE_VENTE',
      description: `Vente enregistrée: ${montant} FCFA`,
      severity: 'info',
      entity_type: 'caisse_transaction',
      entity_id: transaction.id,
    });

    return c.json({ transaction }, 201);
  } catch (error) {
    console.log('Error in enregistrerVente:', error);
    return c.json({ error: 'Erreur serveur' }, 500);
  }
}

/**
 * POST /api/caisse/depense - Enregistrer une dépense
 */
export async function enregistrerDepense(c: Context) {
  const auth = await checkAuth(c);
  if (!auth.authorized) {
    return c.json({ error: auth.error }, 401);
  }

  try {
    const body = await c.req.json();
    const { montant, notes } = body;

    if (!montant || montant <= 0) {
      return c.json({ error: 'Montant invalide' }, 400);
    }

    const { data: transaction, error } = await supabase
      .from('caisse_transactions')
      .insert({
        marchand_id: auth.user.id,
        type: 'depense',
        montant: parseFloat(montant),
        notes,
      })
      .select()
      .single();

    if (error) {
      console.log('Error creating depense:', error);
      return c.json({ error: 'Erreur lors de l\'enregistrement' }, 500);
    }

    await supabase.from('audit_logs').insert({
      user_id: auth.user.id,
      role: auth.user.role,
      action: 'CAISSE_DEPENSE',
      description: `Dépense enregistrée: ${montant} FCFA`,
      severity: 'info',
      entity_type: 'caisse_transaction',
      entity_id: transaction.id,
    });

    return c.json({ transaction }, 201);
  } catch (error) {
    console.log('Error in enregistrerDepense:', error);
    return c.json({ error: 'Erreur serveur' }, 500);
  }
}

// Exports avec noms attendus par index.tsx
export const getTransactions = getCaisseTransactions;
export const createVente = enregistrerVente;
export const createDepense = enregistrerDepense;

/**
 * GET /api/caisse/session - Session caisse actuelle
 */
export async function getCurrentSession(c: Context) {
  const auth = await checkAuth(c);
  if (!auth.authorized) {
    return c.json({ error: auth.error }, 401);
  }

  try {
    const today = new Date().toISOString().split('T')[0];
    
    const { data: session, error } = await supabase
      .from('caisse_sessions')
      .select('*')
      .eq('marchand_id', auth.user.id)
      .eq('date', today)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.log('Error fetching session:', error);
      return c.json({ error: 'Erreur lors du chargement' }, 500);
    }

    return c.json({ session: session || null });
  } catch (error) {
    console.log('Error in getCurrentSession:', error);
    return c.json({ error: 'Erreur serveur' }, 500);
  }
}

/**
 * POST /api/caisse/session/open - Ouvrir une session
 */
export async function openSession(c: Context) {
  const auth = await checkAuth(c);
  if (!auth.authorized) {
    return c.json({ error: auth.error }, 401);
  }

  try {
    const body = await c.req.json();
    const { fond_initial, notes } = body;

    if (!fond_initial || fond_initial < 0) {
      return c.json({ error: 'Fond initial invalide' }, 400);
    }

    const today = new Date().toISOString().split('T')[0];

    const { data: session, error } = await supabase
      .from('caisse_sessions')
      .insert({
        marchand_id: auth.user.id,
        date: today,
        fond_initial: parseFloat(fond_initial),
        ouvert: true,
        heure_ouverture: new Date().toISOString(),
        notes,
      })
      .select()
      .single();

    if (error) {
      console.log('Error opening session:', error);
      return c.json({ error: 'Erreur lors de l\'ouverture' }, 500);
    }

    await supabase.from('audit_logs').insert({
      user_id: auth.user.id,
      role: auth.user.role,
      action: 'CAISSE_OUVRIR',
      description: `Caisse ouverte avec ${fond_initial} FCFA`,
      severity: 'info',
      entity_type: 'caisse_session',
      entity_id: session.id,
    });

    return c.json({ session }, 201);
  } catch (error) {
    console.log('Error in openSession:', error);
    return c.json({ error: 'Erreur serveur' }, 500);
  }
}

/**
 * POST /api/caisse/session/close - Fermer une session
 */
export async function closeSession(c: Context) {
  const auth = await checkAuth(c);
  if (!auth.authorized) {
    return c.json({ error: auth.error }, 401);
  }

  try {
    const body = await c.req.json();
    const { comptage_reel, notes } = body;

    const today = new Date().toISOString().split('T')[0];

    const { data: session, error: fetchError } = await supabase
      .from('caisse_sessions')
      .select('*')
      .eq('marchand_id', auth.user.id)
      .eq('date', today)
      .single();

    if (fetchError || !session) {
      return c.json({ error: 'Aucune session ouverte trouvée' }, 404);
    }

    const { error } = await supabase
      .from('caisse_sessions')
      .update({
        ouvert: false,
        heure_fermeture: new Date().toISOString(),
        comptage_reel: parseFloat(comptage_reel),
        notes_fermeture: notes,
      })
      .eq('id', session.id);

    if (error) {
      console.log('Error closing session:', error);
      return c.json({ error: 'Erreur lors de la fermeture' }, 500);
    }

    await supabase.from('audit_logs').insert({
      user_id: auth.user.id,
      role: auth.user.role,
      action: 'CAISSE_FERMER',
      description: `Caisse fermée avec comptage ${comptage_reel} FCFA`,
      severity: 'info',
      entity_type: 'caisse_session',
      entity_id: session.id,
    });

    return c.json({ success: true });
  } catch (error) {
    console.log('Error in closeSession:', error);
    return c.json({ error: 'Erreur serveur' }, 500);
  }
}

/**
 * GET /api/caisse/stats - Statistiques caisse
 */
export async function getStats(c: Context) {
  const auth = await checkAuth(c);
  if (!auth.authorized) {
    return c.json({ error: auth.error }, 401);
  }

  try {
    const today = new Date().toISOString().split('T')[0];
    
    const { data: transactions, error } = await supabase
      .from('caisse_transactions')
      .select('*')
      .eq('marchand_id', auth.user.id)
      .gte('created_at', `${today}T00:00:00`)
      .lte('created_at', `${today}T23:59:59`);

    if (error) {
      console.log('Error fetching stats:', error);
      return c.json({ error: 'Erreur lors du chargement' }, 500);
    }

    const ventes = transactions?.filter(t => t.type === 'vente') || [];
    const depenses = transactions?.filter(t => t.type === 'depense') || [];

    const stats = {
      ventes_total: ventes.reduce((sum, t) => sum + t.montant, 0),
      ventes_count: ventes.length,
      depenses_total: depenses.reduce((sum, t) => sum + t.montant, 0),
      depenses_count: depenses.length,
    };

    return c.json({ stats });
  } catch (error) {
    console.log('Error in getStats:', error);
    return c.json({ error: 'Erreur serveur' }, 500);
  }
}