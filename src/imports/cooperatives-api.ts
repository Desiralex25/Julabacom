/**
 * API Cooperatives (Mode Local)
 */

export async function fetchCooperatives(): Promise<any> {
  console.log('Mode local - fetchCooperatives non disponible');
  return { cooperatives: [] };
}

export async function fetchCooperativeById(id: string): Promise<any> {
  console.log('Mode local - fetchCooperativeById non disponible');
  return { cooperative: null };
}

export async function fetchCooperative(): Promise<any> {
  console.log('Mode local - fetchCooperative non disponible');
  return { cooperative: null };
}

export async function fetchCooperativeMembres(): Promise<any> {
  console.log('Mode local - fetchCooperativeMembres non disponible');
  return { membres: [] };
}

export async function fetchCooperativeTresorerie(): Promise<any> {
  console.log('Mode local - fetchCooperativeTresorerie non disponible');
  return { transactions: [] };
}

export async function addCooperativeMembre(membre: any): Promise<any> {
  console.log('Mode local - addCooperativeMembre non disponible');
  return { success: false, error: 'Mode local - backend non disponible' };
}

export async function addTresorerieTransaction(transaction: any): Promise<any> {
  console.log('Mode local - addTresorerieTransaction non disponible');
  return { success: false, error: 'Mode local - backend non disponible' };
}

export async function createCooperative(cooperative: any): Promise<any> {
  console.log('Mode local - createCooperative non disponible');
  return { success: false, error: 'Mode local - backend non disponible' };
}

export async function updateCooperative(id: string, updates: any): Promise<any> {
  console.log('Mode local - updateCooperative non disponible');
  return { success: false, error: 'Mode local - backend non disponible' };
}