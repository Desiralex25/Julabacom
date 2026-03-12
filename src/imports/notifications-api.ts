/**
 * API Notifications (Mode Local)
 */

import { apiRequest, type ApiResponse } from './api-client';

export async function fetchNotifications(userId: string): Promise<ApiResponse> {
  return apiRequest(`/notifications/${userId}`);
}

export async function markNotificationAsRead(notificationId: string): Promise<ApiResponse> {
  return apiRequest(`/notifications/${notificationId}/read`, {
    method: 'PUT',
  });
}

export async function sendNotification(notification: any): Promise<ApiResponse> {
  return apiRequest('/notifications', {
    method: 'POST',
    body: JSON.stringify(notification),
  });
}
