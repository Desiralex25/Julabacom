/**
 * API Scores (Mode Local)
 */

import { apiRequest, type ApiResponse } from './api-client';

export async function fetchScore(userId: string): Promise<ApiResponse> {
  return apiRequest(`/scores/${userId}`);
}

export async function updateScore(userId: string, points: number): Promise<ApiResponse> {
  return apiRequest(`/scores/${userId}`, {
    method: 'PUT',
    body: JSON.stringify({ points }),
  });
}

export async function fetchLeaderboard(): Promise<ApiResponse> {
  return apiRequest('/scores/leaderboard');
}
