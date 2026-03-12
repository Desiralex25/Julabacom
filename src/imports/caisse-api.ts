/**
 * API Caisse (Mode Local)
 */

import { apiRequest, type ApiResponse } from './api-client';

export async function createVente(vente: any): Promise<ApiResponse> {
  return apiRequest('/caisse/ventes', {
    method: 'POST',
    body: JSON.stringify(vente),
  });
}

export async function fetchVentes(userId: string): Promise<ApiResponse> {
  return apiRequest(`/caisse/ventes/${userId}`);
}

export async function updateCaisse(userId: string, updates: any): Promise<ApiResponse> {
  return apiRequest(`/caisse/${userId}`, {
    method: 'PUT',
    body: JSON.stringify(updates),
  });
}
