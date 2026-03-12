/**
 * ═══════════════════════════════════════════════════════════════════
 * JÙLABA — Client Mock (Supabase supprimé)
 * ═══════════════════════════════════════════════════════════════════
 *
 * Mock client pour remplacer Supabase
 * L'application fonctionne maintenant uniquement en mode local
 */

// Mock query builder
const createMockQueryBuilder = () => ({
  select: function(columns?: string) { return this; },
  insert: function(data: any) { return this; },
  update: function(data: any) { return this; },
  delete: function() { return this; },
  eq: function(column: string, value: any) { return this; },
  in: function(column: string, values: any[]) { return this; },
  ilike: function(column: string, pattern: string) { return this; },
  order: function(column: string, options?: any) { return this; },
  limit: function(count: number) { return this; },
  maybeSingle: async function() { return { data: null, error: null }; },
  single: async function() { return { data: null, error: null }; },
  then: async function(resolve: any) { 
    return resolve({ data: null, error: null }); 
  },
});

// Mock auth object
const mockAuth = {
  setSession: async () => ({ data: { session: null }, error: null }),
  getSession: async () => ({ data: { session: null }, error: null }),
  signOut: async () => ({ error: null }),
  getUser: async () => ({ data: { user: null }, error: null }),
  refreshSession: async () => ({ data: { session: null }, error: null }),
  signInWithPassword: async () => ({ data: { session: null, user: null }, error: null }),
  onAuthStateChange: (callback: any) => {
    // Retourner un mock de subscription
    return {
      data: {
        subscription: {
          unsubscribe: () => {},
        },
      },
    };
  },
  admin: {
    createUser: async () => ({ data: { user: null }, error: null }),
    deleteUser: async () => ({ error: null }),
    getUserById: async () => ({ data: { user: null }, error: null }),
    listUsers: async () => ({ data: { users: [] }, error: null }),
    updateUserById: async () => ({ error: null }),
    signOut: async () => ({ error: null }),
  },
};

// Mock supabase client
export const supabase = {
  auth: mockAuth,
  from: (table: string) => createMockQueryBuilder(),
};