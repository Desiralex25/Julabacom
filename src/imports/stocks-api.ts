/**
 * API Stocks (Mode Local)
 */

import { apiRequest, type ApiResponse } from './api-client';

export async function fetchStock(userId: string): Promise<ApiResponse> {
  return apiRequest(`/stocks/${userId}`);
}

export async function updateStock(userId: string, updates: any): Promise<ApiResponse> {
  return apiRequest(`/stocks/${userId}`, {
    method: 'PUT',
    body: JSON.stringify(updates),
  });
}

export async function addProduct(userId: string, product: any): Promise<ApiResponse> {
  return apiRequest(`/stocks/${userId}/products`, {
    method: 'POST',
    body: JSON.stringify(product),
  });
}
