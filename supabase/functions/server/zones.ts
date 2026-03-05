/**
 * Routes Zones - JÙLABA
 * Gestion des zones géographiques
 */

import { Context } from "npm:hono";
import { sharedSupabase as supabase } from "./auth-helper.ts";

/**
 * GET /api/zones - Liste toutes les zones
 * Accessible à tous les utilisateurs authentifiés
 */
export async function getZones(c: Context) {
  try {
    const { data: zones, error } = await supabase
      .from('zones')
      .select('*')
      .eq('actif', true)
      .order('nom', { ascending: true });

    if (error) {
      console.log('Error fetching zones:', error);
      return c.json({ error: 'Erreur lors du chargement des zones' }, 500);
    }

    return c.json({ zones: zones || [] });
  } catch (error) {
    console.log('Error in getZones:', error);
    return c.json({ error: 'Erreur serveur' }, 500);
  }
}

/**
 * GET /api/zones/:id - Détails d'une zone
 */
export async function getZoneById(c: Context) {
  try {
    const zoneId = c.req.param('id');

    const { data: zone, error } = await supabase
      .from('zones')
      .select('*')
      .eq('id', zoneId)
      .single();

    if (error || !zone) {
      return c.json({ error: 'Zone introuvable' }, 404);
    }

    return c.json({ zone });
  } catch (error) {
    console.log('Error in getZoneById:', error);
    return c.json({ error: 'Erreur serveur' }, 500);
  }
}