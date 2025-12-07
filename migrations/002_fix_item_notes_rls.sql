-- Fix RLS policies on item_notes to match other tables
-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Allow reading notes except by item owner" ON item_notes;
DROP POLICY IF EXISTS "Allow creating notes" ON item_notes;
DROP POLICY IF EXISTS "Allow deleting own notes" ON item_notes;

-- Create simplified policy for family use (authorization handled by API routes)
CREATE POLICY "Allow all operations on item_notes" ON item_notes FOR ALL USING (true);
