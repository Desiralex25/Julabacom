/**
 * Routes Stocks - JÙLABA
 * Gestion des stocks marchands/producteurs
 */

import { Context } from "npm:hono";
import { checkAuth, sharedSupabase as supabase } from "./auth-helper.ts";

/**
 * GET /api/stocks - Liste du stock
 */
export async function getStocks(c: Context) {
  const auth = await checkAuth(c);
  if (!auth.authorized) {
    return c.json({ error: auth.error }, 401);
  }

  try {
    const { data: stocks, error } = await supabase
      .from('stocks')
      .select('*')
      .eq('user_id', auth.user.id)
      .order('produit', { ascending: true });

    if (error) {
      console.log('Error fetching stocks:', error);
      return c.json({ error: 'Erreur lors du chargement du stock' }, 500);
    }

    return c.json({ stocks: stocks || [] });
  } catch (error) {
    console.log('Error in getStocks:', error);
    return c.json({ error: 'Erreur serveur' }, 500);
  }
}

/**
 * POST /api/stocks - Ajouter au stock (ou mettre à jour si existe)
 */
export async function upsertStock(c: Context) {
  const auth = await checkAuth(c);
  if (!auth.authorized) {
    return c.json({ error: auth.error }, 401);
  }

  try {
    const body = await c.req.json();
    const { produit, quantite, unite, prix_achat } = body;

    if (!produit || quantite === undefined || !unite) {
      return c.json({ error: 'Champs obligatoires manquants' }, 400);
    }

    // Vérifier si le produit existe déjà
    const { data: existingStock } = await supabase
      .from('stocks')
      .select('*')
      .eq('user_id', auth.user.id)
      .eq('produit', produit)
      .single();

    let stock;
    let isNew = false;

    if (existingStock) {
      // Mettre à jour la quantité
      const newQuantite = parseFloat(existingStock.quantite) + parseFloat(quantite);
      
      const { data, error } = await supabase
        .from('stocks')
        .update({ 
          quantite: newQuantite,
          prix_achat: prix_achat || existingStock.prix_achat,
          derniere_modification: new Date().toISOString()
        })
        .eq('id', existingStock.id)
        .select()
        .single();

      if (error) throw error;
      stock = data;
    } else {
      // Créer un nouveau stock
      const { data, error } = await supabase
        .from('stocks')
        .insert({
          user_id: auth.user.id,
          produit,
          quantite: parseFloat(quantite),
          unite,
          prix_achat: prix_achat ? parseFloat(prix_achat) : null,
          derniere_modification: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;
      stock = data;
      isNew = true;
    }

    await supabase.from('audit_logs').insert({
      user_id: auth.user.id,
      role: auth.user.role,
      action: isNew ? 'CREATE_STOCK' : 'UPDATE_STOCK',
      description: `Stock ${isNew ? 'créé' : 'modifié'}: ${produit} (${quantite} ${unite})`,
      severity: 'info',
      entity_type: 'stock',
      entity_id: stock.id,
    });

    return c.json({ stock }, isNew ? 201 : 200);
  } catch (error) {
    console.log('Error in upsertStock:', error);
    return c.json({ error: 'Erreur serveur' }, 500);
  }
}

/**
 * PATCH /api/stocks/:id - Modifier un stock
 */
export async function updateStock(c: Context) {
  const auth = await checkAuth(c);
  if (!auth.authorized) {
    return c.json({ error: auth.error }, 401);
  }

  try {
    const stockId = c.req.param('id');
    const body = await c.req.json();

    const { data: existingStock, error: fetchError } = await supabase
      .from('stocks')
      .select('*')
      .eq('id', stockId)
      .single();

    if (fetchError || !existingStock) {
      return c.json({ error: 'Stock introuvable' }, 404);
    }

    if (existingStock.user_id !== auth.user.id) {
      return c.json({ error: 'Non autorisé' }, 403);
    }

    const { data: stock, error } = await supabase
      .from('stocks')
      .update({ 
        ...body,
        derniere_modification: new Date().toISOString()
      })
      .eq('id', stockId)
      .select()
      .single();

    if (error) {
      console.log('Error updating stock:', error);
      return c.json({ error: 'Erreur lors de la mise à jour' }, 500);
    }

    return c.json({ stock });
  } catch (error) {
    console.log('Error in updateStock:', error);
    return c.json({ error: 'Erreur serveur' }, 500);
  }
}

/**
 * DELETE /api/stocks/:id - Supprimer un stock
 */
export async function deleteStock(c: Context) {
  const auth = await checkAuth(c);
  if (!auth.authorized) {
    return c.json({ error: auth.error }, 401);
  }

  try {
    const stockId = c.req.param('id');

    const { data: existingStock, error: fetchError } = await supabase
      .from('stocks')
      .select('*')
      .eq('id', stockId)
      .single();

    if (fetchError || !existingStock) {
      return c.json({ error: 'Stock introuvable' }, 404);
    }

    if (existingStock.user_id !== auth.user.id) {
      return c.json({ error: 'Non autorisé' }, 403);
    }

    const { error } = await supabase
      .from('stocks')
      .delete()
      .eq('id', stockId);

    if (error) {
      console.log('Error deleting stock:', error);
      return c.json({ error: 'Erreur lors de la suppression' }, 500);
    }

    await supabase.from('audit_logs').insert({
      user_id: auth.user.id,
      role: auth.user.role,
      action: 'DELETE_STOCK',
      description: `Stock supprimé: ${existingStock.produit}`,
      severity: 'warning',
      entity_type: 'stock',
      entity_id: stockId,
    });

    return c.json({ success: true });
  } catch (error) {
    console.log('Error in deleteStock:', error);
    return c.json({ error: 'Erreur serveur' }, 500);
  }
}