/**
 * Client API Notifications - JÙLABA
 */

import { projectId, publicAnonKey } from '/utils/supabase/info';

const API_URL = `https://${projectId}.supabase.co/functions/v1/make-server-488793d3/api`;

function getAccessToken(): string {
  return localStorage.getItem('julaba_access_token') || publicAnonKey;
}

async function apiRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getAccessToken();
  
  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Erreur API');
  }

  return response.json();
}

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────

export interface Notification {
  id: string;
  user_id: string;
  role?: string;
  type: string;
  titre: string;
  message: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  is_read: boolean;
  category?: string;
  icon?: string;
  metadata?: any;
  created_at: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// API FUNCTIONS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Récupérer toutes les notifications de l'utilisateur
 */
export async function fetchNotifications(): Promise<{ notifications: Notification[] }> {
  return apiRequest<{ notifications: Notification[] }>('/notifications');
}

/**
 * Marquer une notification comme lue
 */
export async function markNotificationAsRead(id: string): Promise<{ notification: Notification }> {
  return apiRequest<{ notification: Notification }>(`/notifications/${id}/read`, {
    method: 'PATCH',
  });
}

/**
 * Supprimer une notification
 */
export async function deleteNotification(id: string): Promise<{ success: boolean }> {
  return apiRequest<{ success: boolean }>(`/notifications/${id}`, {
    method: 'DELETE',
  });
}
