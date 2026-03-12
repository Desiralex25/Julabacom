/**
 * API Missions (Mode Local)
 */

export async function fetchMissions(userId?: string): Promise<any> {
  console.log('Mode local - fetchMissions non disponible');
  return { missions: [] };
}

export async function updateMissionProgres(id: string, progres: number): Promise<any> {
  console.log('Mode local - updateMissionProgres non disponible');
  return { success: false, error: 'Mode local - backend non disponible' };
}

export async function createMission(mission: any): Promise<any> {
  console.log('Mode local - createMission non disponible');
  return { success: false, error: 'Mode local - backend non disponible' };
}