import { projectId, publicAnonKey } from '/utils/supabase/info';

const API_BASE_URL = `https://${projectId}.supabase.co/functions/v1/make-server-488793d3`;

export interface ApiResponse<T = any> {
  success?: boolean;
  error?: string;
  details?: string;
  data?: T;
}

/**
 * Envoyer un code OTP par SMS
 */
export async function sendOTP(phone: string): Promise<ApiResponse<{ code?: string; expiresAt?: string }>> {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/send-otp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${publicAnonKey}`
      },
      body: JSON.stringify({ phone })
    });

    const data = await response.json();
    
    if (!response.ok) {
      return { 
        error: data.error || 'Erreur lors de l\'envoi du code',
        details: data.details 
      };
    }

    return { 
      success: true, 
      data: data.devOnly // Code OTP en développement uniquement
    };
  } catch (error) {
    console.error('Error sending OTP:', error);
    return { 
      error: 'Erreur réseau lors de l\'envoi du code',
      details: error instanceof Error ? error.message : 'Erreur inconnue'
    };
  }
}

/**
 * Vérifier le code OTP et connecter l'utilisateur
 */
export async function verifyOTP(phone: string, code: string): Promise<ApiResponse<{
  newUser: boolean;
  accessToken?: string;
  refreshToken?: string;
  user?: any;
  phone?: string;
  message?: string;
}>> {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/verify-otp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${publicAnonKey}`
      },
      body: JSON.stringify({ phone, code })
    });

    const data = await response.json();
    
    if (!response.ok) {
      return { 
        error: data.error || 'Code OTP invalide',
        details: data.details 
      };
    }

    return { success: true, data };
  } catch (error) {
    console.error('Error verifying OTP:', error);
    return { 
      error: 'Erreur réseau lors de la vérification',
      details: error instanceof Error ? error.message : 'Erreur inconnue'
    };
  }
}
