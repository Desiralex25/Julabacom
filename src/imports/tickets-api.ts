/**
 * API Tickets (Mode Local)
 */

export async function createTicket(ticket: any): Promise<any> {
  console.log('Mode local - createTicket non disponible');
  return { success: false, error: 'Mode local - backend non disponible' };
}

export async function fetchTickets(userId?: string): Promise<any> {
  console.log('Mode local - fetchTickets non disponible');
  return { tickets: [] };
}

export async function updateTicket(id: string, updates: any): Promise<any> {
  console.log('Mode local - updateTicket non disponible');
  return { success: false, error: 'Mode local - backend non disponible' };
}