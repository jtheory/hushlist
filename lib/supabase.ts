import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

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
