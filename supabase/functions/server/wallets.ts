/**
 * Routes Wallets - JÙLABA
 * Gestion des portefeuilles et transactions
 */

import { Context } from "npm:hono";
import { checkAuth, sharedSupabase as supabase } from "./auth-helper.ts";

/**
 * GET /api/wallet - Récupérer le wallet de l'utilisateur
 */
export async function getWallet(c: Context) {
  const auth = await checkAuth(c);
  if (!auth.authorized) {
    return c.json({ error: auth.error }, 401);
  }

  try {
    let { data: wallet, error } = await supabase
      .from('wallets')
      .select('*')
      .eq('user_id', auth.user.id)
      .single();

    // Si le wallet n'existe pas, le créer
    if (error || !wallet) {
      const { data: newWallet, error: createError } = await supabase
        .from('wallets')
        .insert({
          user_id: auth.user.id,
          solde: 0,
          solde_bloque: 0,
        })
        .select()
        .single();

      if (createError) {
        console.log('Error creating wallet:', createError);
        return c.json({ error: 'Erreur lors de la création du wallet' }, 500);
      }

      wallet = newWallet;
    }

    return c.json({ wallet });
  } catch (error) {
    console.log('Error in getWallet:', error);
    return c.json({ error: 'Erreur serveur' }, 500);
  }
}

/**
 * POST /api/wallet/credit - Créditer le wallet
 */
export async function creditWallet(c: Context) {
  const auth = await checkAuth(c);
  if (!auth.authorized) {
    return c.json({ error: auth.error }, 401);
  }

  try {
    const body = await c.req.json();
    const { montant, description, reference } = body;

    if (!montant || montant <= 0) {
      return c.json({ error: 'Montant invalide' }, 400);
    }

    // Récupérer ou créer le wallet
    let { data: wallet } = await supabase
      .from('wallets')
      .select('*')
      .eq('user_id', auth.user.id)
      .single();

    if (!wallet) {
      const { data: newWallet } = await supabase
        .from('wallets')
        .insert({ user_id: auth.user.id, solde: 0, solde_bloque: 0 })
        .select()
        .single();
      wallet = newWallet;
    }

    // Mettre à jour le solde
    const nouveauSolde = parseFloat(wallet.solde) + parseFloat(montant);
    
    const { data: updatedWallet, error: updateError } = await supabase
      .from('wallets')
      .update({ solde: nouveauSolde })
      .eq('id', wallet.id)
      .select()
      .single();

    if (updateError) {
      console.log('Error updating wallet:', updateError);
      return c.json({ error: 'Erreur lors du crédit' }, 500);
    }

    // Créer une transaction
    await supabase.from('wallet_transactions').insert({
      wallet_id: wallet.id,
      user_id: auth.user.id,
      type: 'credit',
      montant: parseFloat(montant),
      description: description || 'Crédit',
      reference,
      statut: 'completed',
    });

    await supabase.from('audit_logs').insert({
      user_id: auth.user.id,
      role: auth.user.role,
      action: 'CREDIT_WALLET',
      description: `Crédit de ${montant} FCFA`,
      severity: 'info',
      entity_type: 'wallet',
      entity_id: wallet.id,
    });

    return c.json({ wallet: updatedWallet });
  } catch (error) {
    console.log('Error in creditWallet:', error);
    return c.json({ error: 'Erreur serveur' }, 500);
  }
}

/**
 * POST /api/wallet/debit - Débiter le wallet
 */
export async function debitWallet(c: Context) {
  const auth = await checkAuth(c);
  if (!auth.authorized) {
    return c.json({ error: auth.error }, 401);
  }

  try {
    const body = await c.req.json();
    const { montant, description, reference } = body;

    if (!montant || montant <= 0) {
      return c.json({ error: 'Montant invalide' }, 400);
    }

    const { data: wallet, error: fetchError } = await supabase
      .from('wallets')
      .select('*')
      .eq('user_id', auth.user.id)
      .single();

    if (fetchError || !wallet) {
      return c.json({ error: 'Wallet introuvable' }, 404);
    }

    // Vérifier le solde disponible
    if (parseFloat(wallet.solde) < parseFloat(montant)) {
      return c.json({ error: 'Solde insuffisant' }, 400);
    }

    // Débiter
    const nouveauSolde = parseFloat(wallet.solde) - parseFloat(montant);
    
    const { data: updatedWallet, error: updateError } = await supabase
      .from('wallets')
      .update({ solde: nouveauSolde })
      .eq('id', wallet.id)
      .select()
      .single();

    if (updateError) {
      console.log('Error updating wallet:', updateError);
      return c.json({ error: 'Erreur lors du débit' }, 500);
    }

    // Créer une transaction
    await supabase.from('wallet_transactions').insert({
      wallet_id: wallet.id,
      user_id: auth.user.id,
      type: 'debit',
      montant: parseFloat(montant),
      description: description || 'Débit',
      reference,
      statut: 'completed',
    });

    await supabase.from('audit_logs').insert({
      user_id: auth.user.id,
      role: auth.user.role,
      action: 'DEBIT_WALLET',
      description: `Débit de ${montant} FCFA`,
      severity: 'info',
      entity_type: 'wallet',
      entity_id: wallet.id,
    });

    return c.json({ wallet: updatedWallet });
  } catch (error) {
    console.log('Error in debitWallet:', error);
    return c.json({ error: 'Erreur serveur' }, 500);
  }
}

/**
 * GET /api/wallet/transactions - Historique des transactions wallet
 */
export async function getWalletTransactions(c: Context) {
  const auth = await checkAuth(c);
  if (!auth.authorized) {
    return c.json({ error: auth.error }, 401);
  }

  try {
    const { data: transactions, error } = await supabase
      .from('wallet_transactions')
      .select('*')
      .eq('user_id', auth.user.id)
      .order('created_at', { ascending: false })
      .limit(100);

    if (error) {
      console.log('Error fetching wallet transactions:', error);
      return c.json({ error: 'Erreur lors du chargement' }, 500);
    }

    return c.json({ transactions: transactions || [] });
  } catch (error) {
    console.log('Error in getWalletTransactions:', error);
    return c.json({ error: 'Erreur serveur' }, 500);
  }
}