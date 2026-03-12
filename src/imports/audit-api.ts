/**
 * API Audit (Mode Local)
 */

export async function logAudit(log: any): Promise<any> {
  console.log('Mode local - logAudit non disponible');
  return { success: false, error: 'Mode local - backend non disponible' };
}

export async function createAuditLog(log: any): Promise<any> {
  console.log('Mode local - createAuditLog non disponible');
  return { success: false, error: 'Mode local - backend non disponible' };
}

export async function fetchAuditLogs(filters?: any): Promise<any> {
  console.log('Mode local - fetchAuditLogs non disponible');
  return { logs: [] };
}