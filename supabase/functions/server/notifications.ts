/**
 * Routes Notifications - JÙLABA
 * Gestion des notifications utilisateurs
 */

import { Context } from "npm:hono";
import { checkAuth, sharedSupabase as supabase } from "./auth-helper.ts";

/**
 * GET /api/notifications - Liste des notifications
 */
export async function getNotifications(c: Context) {
  const auth = await checkAuth(c);
  if (!auth.authorized) {
    return c.json({ error: auth.error }, 401);
  }

  try {
    const { data: notifications, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', auth.user.id)
      .order('created_at', { ascending: false })
      .limit(100);

    if (error) {
      console.log('Error fetching notifications:', error);
      return c.json({ error: 'Erreur lors du chargement' }, 500);
    }

    return c.json({ notifications: notifications || [] });
  } catch (error) {
    console.log('Error in getNotifications:', error);
    return c.json({ error: 'Erreur serveur' }, 500);
  }
}

/**
 * PATCH /api/notifications/:id/read - Marquer comme lue
 */
export async function markAsRead(c: Context) {
  const auth = await checkAuth(c);
  if (!auth.authorized) {
    return c.json({ error: auth.error }, 401);
  }

  try {
    const notificationId = c.req.param('id');

    const { data: notification, error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', notificationId)
      .eq('user_id', auth.user.id)
      .select()
      .single();

    if (error) {
      console.log('Error marking notification as read:', error);
      return c.json({ error: 'Erreur lors de la mise à jour' }, 500);
    }

    if (!notification) {
      return c.json({ error: 'Notification introuvable' }, 404);
    }

    return c.json({ notification });
  } catch (error) {
    console.log('Error in markAsRead:', error);
    return c.json({ error: 'Erreur serveur' }, 500);
  }
}

/**
 * DELETE /api/notifications/:id - Supprimer une notification
 */
export async function deleteNotification(c: Context) {
  const auth = await checkAuth(c);
  if (!auth.authorized) {
    return c.json({ error: auth.error }, 401);
  }

  try {
    const notificationId = c.req.param('id');

    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('id', notificationId)
      .eq('user_id', auth.user.id);

    if (error) {
      console.log('Error deleting notification:', error);
      return c.json({ error: 'Erreur lors de la suppression' }, 500);
    }

    return c.json({ success: true });
  } catch (error) {
    console.log('Error in deleteNotification:', error);
    return c.json({ error: 'Erreur serveur' }, 500);
  }
}

/**
 * POST /api/notifications - Créer une notification (système uniquement)
 */
export async function createNotification(c: Context) {
  try {
    const body = await c.req.json();
    const { user_id, role, type, titre, message, priority, category, icon, metadata } = body;

    if (!user_id || !type || !titre || !message) {
      return c.json({ error: 'Champs obligatoires manquants' }, 400);
    }

    const { data: notification, error } = await supabase
      .from('notifications')
      .insert({
        user_id,
        role,
        type,
        titre,
        message,
        priority: priority || 'medium',
        category,
        icon,
        metadata,
        is_read: false,
      })
      .select()
      .single();

    if (error) {
      console.log('Error creating notification:', error);
      return c.json({ error: 'Erreur lors de la création' }, 500);
    }

    return c.json({ notification }, 201);
  } catch (error) {
    console.log('Error in createNotification:', error);
    return c.json({ error: 'Erreur serveur' }, 500);
  }
}