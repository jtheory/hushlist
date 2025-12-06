import { createClient } from '@supabase/supabase-js';

// Server-side only: Use Netlify integration vars or local dev vars
// Note: This module should only be imported by server-side code (API routes)
const supabaseUrl = process.env.SUPABASE_DATABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase credentials. Please set:\n' +
    '- SUPABASE_DATABASE_URL and SUPABASE_ANON_KEY (Netlify integration)\n' +
    '- OR NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY (local .env.local)'
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type User = {
  id: string;
  name: string;
  email: string;
  created_at: string;
};

export type WishlistItem = {
  id: string;
  user_id: string;
  item_text: string;
  claimed_by: string | null;
  created_at: string;
  updated_at: string;
};
