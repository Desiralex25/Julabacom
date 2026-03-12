/**
 * API Utils (Mode Local)
 */

export interface ApiResponse<T = any> {
  success?: boolean;
  error?: string;
  details?: string;
  data?: T;
}

/**
 * Envoyer un code OTP par SMS (mode local)
 */
export async function sendOTP(phone: string): Promise<ApiResponse<{ code?: string; expiresAt?: string }>> {
  console.log('Mode local - OTP non disponible');
  return { 
    error: 'Mode local - utilisez le mode DEV pour tester',
  };
}

/**
 * Verifier le code OTP (mode local)
 */
export async function verifyOTP(phone: string, code: string): Promise<ApiResponse<{
  newUser: boolean;
  accessToken?: string;
  refreshToken?: string;
  user?: any;
  phone?: string;
  message?: string;
}>> {
  console.log('Mode local - OTP non disponible');
  return { 
    error: 'Mode local - utilisez le mode DEV pour tester',
  };
}

/**
 * Recuperer les parametres systeme (mode local)
 */
export async function getSystemSettings(): Promise<{ 
  success?: boolean;
  error?: string;
  settings?: {
    supportPhone?: string;
  };
}> {
  return { 
    success: true, 
    settings: {
      supportPhone: '+225 0700000000'
    }
  };
}
