/**
 * API Recoltes (Mode Local)
 */

export async function createRecolte(recolte: any): Promise<any> {
  console.log('Mode local - createRecolte non disponible');
  return { success: false, error: 'Mode local - backend non disponible' };
}

export async function fetchRecoltes(userId?: string): Promise<any> {
  console.log('Mode local - fetchRecoltes non disponible');
  return { recoltes: [] };
}

export async function updateRecolte(id: string, updates: any): Promise<any> {
  console.log('Mode local - updateRecolte non disponible');
  return { success: false, error: 'Mode local - backend non disponible' };
}

export async function deleteRecolte(id: string): Promise<any> {
  console.log('Mode local - deleteRecolte non disponible');
  return { success: false, error: 'Mode local - backend non disponible' };
}