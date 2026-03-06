/**
 * Client API Audit - JÙLABA
 */

import { projectId } from '/utils/supabase/info';
import { apiRequest as _apiRequest } from './api-client';

const API_URL = `https://${projectId}.supabase.co/functions/v1/make-server-488793d3/api`;

function apiRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  return _apiRequest<T>(API_URL, endpoint, options);
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

// ─────────────���───────────────────────────────────────────────────────────────
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