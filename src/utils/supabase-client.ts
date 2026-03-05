import { createClient } from '@supabase/supabase-js';
import { projectId, publicAnonKey } from '../../utils/supabase/info';

// URL Supabase construite depuis le projectId
const supabaseUrl = `https://${projectId}.supabase.co`;

// Client Supabase singleton pour le frontend
export const supabase = createClient(supabaseUrl, publicAnonKey);
