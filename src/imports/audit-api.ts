/**
 * Client API Audit - JÙLABA
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

export interface AuditLog {
  id: string;
  user_id?: string;
  role?: string;
  action: string;
  description?: string;
  severity: 'info' | 'warning' | 'critical';
  entity_type?: string;
  entity_id?: string;
  metadata?: any;
  created_at: string;
}

export interface CreateAuditLogData {
  action: string;
  description?: string;
  severity?: 'info' | 'warning' | 'critical';
  entity_type?: string;
  entity_id?: string;
  metadata?: any;
}

// ─────────────────────────────────────────────────────────────────────────────
// API FUNCTIONS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Récupérer les logs d'audit (admin uniquement)
 */
export async function fetchAuditLogs(): Promise<{ logs: AuditLog[] }> {
  return apiRequest<{ logs: AuditLog[] }>('/audit');
}

/**
 * Créer un log d'audit
 */
export async function createAuditLog(data: CreateAuditLogData): Promise<{ log: AuditLog }> {
  return apiRequest<{ log: AuditLog }>('/audit', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}
