-- Create item_notes table for secret notes on wishlist items
CREATE TABLE item_notes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  item_id UUID REFERENCES wishlist_items(id) ON DELETE CASCADE NOT NULL,
  author_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  note_text TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX item_notes_item_id_idx ON item_notes(item_id);

-- Enable Row Level Security
ALTER TABLE item_notes ENABLE ROW LEVEL SECURITY;

-- Create policies
-- Allow authenticated users to read notes for items they can see
-- Exclude notes from the item owner (user who created the wishlist item)
CREATE POLICY "Allow reading notes except by item owner" ON item_notes
  FOR SELECT
  USING (
    author_id = auth.uid() OR
    item_id IN (
      SELECT id FROM wishlist_items
      WHERE user_id != auth.uid()
    )
  );

-- Allow authenticated users to create notes
CREATE POLICY "Allow creating notes" ON item_notes
  FOR INSERT
  WITH CHECK (author_id = auth.uid());

-- Allow users to delete their own notes
CREATE POLICY "Allow deleting own notes" ON item_notes
  FOR DELETE
  USING (author_id = auth.uid());
