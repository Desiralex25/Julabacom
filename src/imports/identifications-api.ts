/**
 * API Identifications (Mode Local)
 */

export async function createIdentification(identification: any): Promise<any> {
  console.log('Mode local - createIdentification non disponible');
  return { success: false, error: 'Mode local - backend non disponible' };
}

export async function fetchIdentifications(userId?: string): Promise<any> {
  console.log('Mode local - fetchIdentifications non disponible');
  return { identifications: [] };
}

export async function updateIdentification(id: string, updates: any): Promise<any> {
  console.log('Mode local - updateIdentification non disponible');
  return { success: false, error: 'Mode local - backend non disponible' };
}