import { createClient } from '@supabase/supabase-js';

// Use Netlify-provided env vars first, then fall back to NEXT_PUBLIC_ vars for local dev
const supabaseUrl = process.env.SUPABASE_DATABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase credentials. Please set SUPABASE_DATABASE_URL and SUPABASE_ANON_KEY ' +
    '(via Netlify integration) or NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY ' +
    '(in .env.local for local development)'
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
