/**
 * API Commandes (Mode Local)
 */

export async function createCommande(commande: any): Promise<any> {
  console.log('Mode local - createCommande non disponible');
  return { success: false, error: 'Mode local - backend non disponible' };
}

export async function fetchCommandes(userId?: string): Promise<any> {
  console.log('Mode local - fetchCommandes non disponible');
  return { commandes: [] };
}

export async function updateCommande(id: string, updates: any): Promise<any> {
  console.log('Mode local - updateCommande non disponible');
  return { success: false, error: 'Mode local - backend non disponible' };
}

export async function deleteCommande(id: string): Promise<any> {
  console.log('Mode local - deleteCommande non disponible');
  return { success: false, error: 'Mode local - backend non disponible' };
}