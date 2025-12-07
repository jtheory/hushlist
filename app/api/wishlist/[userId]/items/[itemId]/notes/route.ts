import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// GET /api/wishlist/[userId]/items/[itemId]/notes - Get all notes for an item
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string; itemId: string }> }
) {
  try {
    const { itemId, userId } = await params;
    const url = new URL(request.url);
    const currentUserId = url.searchParams.get('currentUserId');

    if (!currentUserId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Don't show notes to the list owner
    if (currentUserId === userId) {
      return NextResponse.json([]);
    }

    // Get notes with author information
    const { data, error } = await supabase
      .from('item_notes')
      .select(`
        *,
        author:users!item_notes_author_id_fkey(id, name, email)
      `)
      .eq('item_id', itemId)
      .order('created_at', { ascending: true });

    if (error) {
      throw error;
    }

    return NextResponse.json(data || []);
  } catch (error) {
    console.error('Error fetching notes:', error);
    return NextResponse.json({ error: 'Failed to fetch notes' }, { status: 500 });
  }
}

// POST /api/wishlist/[userId]/items/[itemId]/notes - Add a note to an item
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string; itemId: string }> }
) {
  try {
    const { itemId, userId } = await params;
    const { note_text, currentUserId } = await request.json();

    if (!currentUserId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Prevent list owner from adding notes to their own items
    if (currentUserId === userId) {
      return NextResponse.json({ error: 'Cannot add notes to your own list' }, { status: 403 });
    }

    if (!note_text || !note_text.trim()) {
      return NextResponse.json({ error: 'Note text is required' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('item_notes')
      .insert({
        item_id: itemId,
        author_id: currentUserId,
        note_text: note_text.trim(),
      })
      .select(`
        *,
        author:users!item_notes_author_id_fkey(id, name, email)
      `)
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error adding note:', error);
    return NextResponse.json({ error: 'Failed to add note' }, { status: 500 });
  }
}

// DELETE /api/wishlist/[userId]/items/[itemId]/notes - Delete all notes for an item
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string; itemId: string }> }
) {
  try {
    const { itemId, userId } = await params;
    const url = new URL(request.url);
    const currentUserId = url.searchParams.get('currentUserId');

    if (!currentUserId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Prevent list owner from deleting notes
    if (currentUserId === userId) {
      return NextResponse.json({ error: 'Cannot delete notes from your own list' }, { status: 403 });
    }

    // Only delete notes authored by the current user
    const { error } = await supabase
      .from('item_notes')
      .delete()
      .eq('item_id', itemId)
      .eq('author_id', currentUserId);

    if (error) {
      throw error;
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting notes:', error);
    return NextResponse.json({ error: 'Failed to delete notes' }, { status: 500 });
  }
}
