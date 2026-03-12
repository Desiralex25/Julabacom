/**
 * API Commissions (Mode Local)
 */

export async function fetchCommissions(userId?: string): Promise<any> {
  console.log('Mode local - fetchCommissions non disponible');
  return { commissions: [] };
}

export async function fetchCommissionsStats(): Promise<any> {
  console.log('Mode local - fetchCommissionsStats non disponible');
  return { stats: null };
}

export async function createCommission(commission: any): Promise<any> {
  console.log('Mode local - createCommission non disponible');
  return { success: false, error: 'Mode local - backend non disponible' };
}