import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// PATCH /api/wishlist/[userId]/items/[itemId] - Update item text
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string; itemId: string }> }
) {
  try {
    const { itemId } = await params;
    const { item_text } = await request.json();

    const { data, error } = await supabase
      .from('wishlist_items')
      .update({ item_text, updated_at: new Date().toISOString() })
      .eq('id', itemId)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error updating item:', error);
    return NextResponse.json({ error: 'Failed to update item' }, { status: 500 });
  }
}

// DELETE /api/wishlist/[userId]/items/[itemId] - Delete item
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string; itemId: string }> }
) {
  try {
    const { itemId } = await params;

    const { error } = await supabase
      .from('wishlist_items')
      .delete()
      .eq('id', itemId);

    if (error) {
      throw error;
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting item:', error);
    return NextResponse.json({ error: 'Failed to delete item' }, { status: 500 });
  }
}
