/**
 * Routes Identifications - JÙLABA
 * Gestion des identifications d'acteurs
 */

import { Context } from "npm:hono";
import { checkAuth, sharedSupabase as supabase } from "./auth-helper.ts";

/**
 * GET /api/identifications - Liste des identifications
 */
export async function getIdentifications(c: Context) {
  const auth = await checkAuth(c);
  if (!auth.authorized) {
    return c.json({ error: auth.error }, 401);
  }

  try {
    const { data: identifications, error } = await supabase
      .from('identifications')
      .select('*')
      .eq('identificateur_id', auth.user.id)
      .order('date_identification', { ascending: false });

    if (error) {
      console.log('Error fetching identifications:', error);
      return c.json({ error: 'Erreur lors du chargement' }, 500);
    }

    return c.json({ identifications: identifications || [] });
  } catch (error) {
    console.log('Error in getIdentifications:', error);
    return c.json({ error: 'Erreur serveur' }, 500);
  }
}

/**
 * POST /api/identifications - Créer une identification
 */
export async function createIdentification(c: Context) {
  const auth = await checkAuth(c);
  if (!auth.authorized) {
    return c.json({ error: auth.error }, 401);
  }

  try {
    const body = await c.req.json();
    const { acteur_id, type_acteur, documents, zone_id, commission, date_identification } = body;

    if (!acteur_id || !type_acteur || !date_identification) {
      return c.json({ error: 'Champs obligatoires manquants' }, 400);
    }

    const identificationData = {
      identificateur_id: auth.user.id,
      acteur_id,
      type_acteur,
      statut: 'en_attente',
      documents,
      zone_id,
      commission: commission ? parseFloat(commission) : null,
      commission_payee: false,
      date_identification,
    };

    const { data: identification, error } = await supabase
      .from('identifications')
      .insert(identificationData)
      .select()
      .single();

    if (error) {
      console.log('Error creating identification:', error);
      return c.json({ error: 'Erreur lors de la création' }, 500);
    }

    // Créer une commission si montant spécifié
    if (commission && parseFloat(commission) > 0) {
      await supabase.from('commissions').insert({
        identificateur_id: auth.user.id,
        identification_id: identification.id,
        montant: parseFloat(commission),
        statut: 'en_attente',
        periode: new Date().toISOString().slice(0, 7), // YYYY-MM
      });
    }

    await supabase.from('audit_logs').insert({
      user_id: auth.user.id,
      role: auth.user.role,
      action: 'CREATE_IDENTIFICATION',
      description: `Identification créée: ${type_acteur}`,
      severity: 'info',
      entity_type: 'identification',
      entity_id: identification.id,
    });

    return c.json({ identification }, 201);
  } catch (error) {
    console.log('Error in createIdentification:', error);
    return c.json({ error: 'Erreur serveur' }, 500);
  }
}

/**
 * PATCH /api/identifications/:id - Modifier une identification
 */
export async function updateIdentification(c: Context) {
  const auth = await checkAuth(c);
  if (!auth.authorized) {
    return c.json({ error: auth.error }, 401);
  }

  try {
    const identificationId = c.req.param('id');
    const body = await c.req.json();

    const { data: existing, error: fetchError } = await supabase
      .from('identifications')
      .select('*')
      .eq('id', identificationId)
      .single();

    if (fetchError || !existing) {
      return c.json({ error: 'Identification introuvable' }, 404);
    }

    if (existing.identificateur_id !== auth.user.id) {
      return c.json({ error: 'Non autorisé' }, 403);
    }

    const { data: identification, error } = await supabase
      .from('identifications')
      .update(body)
      .eq('id', identificationId)
      .select()
      .single();

    if (error) {
      console.log('Error updating identification:', error);
      return c.json({ error: 'Erreur lors de la mise à jour' }, 500);
    }

    await supabase.from('audit_logs').insert({
      user_id: auth.user.id,
      role: auth.user.role,
      action: 'UPDATE_IDENTIFICATION',
      description: `Identification modifiée: ${identificationId}`,
      severity: 'info',
      entity_type: 'identification',
      entity_id: identificationId,
    });

    return c.json({ identification });
  } catch (error) {
    console.log('Error in updateIdentification:', error);
    return c.json({ error: 'Erreur serveur' }, 500);
  }
}