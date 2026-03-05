/**
 * Routes Audit - JÙLABA
 * Consultation des logs d'audit (BackOffice uniquement)
 */

import { Context } from "npm:hono";
import { sharedSupabase as supabase } from "./auth-helper.ts";

async function checkAuthAudit(c: Context) {
  const accessToken = c.req.header('Authorization')?.split(' ')[1];
  if (!accessToken) return { authorized: false, error: 'Token manquant', isAdmin: false };

  const { data: authUser, error: authError } = await supabase.auth.getUser(accessToken);
  if (authError || !authUser?.user) return { authorized: false, error: 'Non autorise', isAdmin: false };

  const { data: userProfile, error: profileError } = await supabase
    .from('users_julaba')
    .select('*')
    .eq('auth_user_id', authUser.user.id)
    .single();

  if (profileError || !userProfile) return { authorized: false, error: 'Profil introuvable', isAdmin: false };
  
  const isAdmin = ['super_admin', 'admin_national', 'gestionnaire_zone', 'analyste'].includes(userProfile.role);
  return { authorized: true, user: userProfile, isAdmin };
}

/**
 * GET /api/audit - Logs d'audit (admin uniquement)
 */
export async function getAuditLogs(c: Context) {
  const auth = await checkAuthAudit(c);
  if (!auth.authorized) {
    return c.json({ error: auth.error }, 401);
  }

  if (!auth.isAdmin) {
    return c.json({ error: 'Accès interdit' }, 403);
  }

  try {
    const { data: logs, error } = await supabase
      .from('audit_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(500);

    if (error) {
      console.log('Error fetching audit logs:', error);
      return c.json({ error: 'Erreur lors du chargement' }, 500);
    }

    return c.json({ logs: logs || [] });
  } catch (error) {
    console.log('Error in getAuditLogs:', error);
    return c.json({ error: 'Erreur serveur' }, 500);
  }
}

/**
 * POST /api/audit - Créer un log d'audit
 */
export async function createAuditLog(c: Context) {
  const auth = await checkAuthAudit(c);
  if (!auth.authorized) {
    return c.json({ error: auth.error }, 401);
  }

  try {
    const body = await c.req.json();
    const { action, description, severity, entity_type, entity_id, metadata } = body;

    if (!action) {
      return c.json({ error: 'Action requise' }, 400);
    }

    const { data: log, error } = await supabase
      .from('audit_logs')
      .insert({
        user_id: auth.user.id,
        role: auth.user.role,
        action,
        description,
        severity: severity || 'info',
        entity_type,
        entity_id,
        metadata,
      })
      .select()
      .single();

    if (error) {
      console.log('Error creating audit log:', error);
      return c.json({ error: 'Erreur lors de la création' }, 500);
    }

    return c.json({ log }, 201);
  } catch (error) {
    console.log('Error in createAuditLog:', error);
    return c.json({ error: 'Erreur serveur' }, 500);
  }
}