/**
 * API Academy (Mode Local)
 */

import { apiRequest, type ApiResponse } from './api-client';

export async function fetchFormations(): Promise<ApiResponse> {
  return apiRequest('/academy/formations');
}

export async function fetchFormationById(id: string): Promise<ApiResponse> {
  return apiRequest(`/academy/formations/${id}`);
}

export async function submitQuizAnswer(quizId: string, answers: any): Promise<ApiResponse> {
  return apiRequest(`/academy/quiz/${quizId}`, {
    method: 'POST',
    body: JSON.stringify(answers),
  });
}

export async function fetchUserProgress(userId: string): Promise<ApiResponse> {
  return apiRequest(`/academy/progress/${userId}`);
}
