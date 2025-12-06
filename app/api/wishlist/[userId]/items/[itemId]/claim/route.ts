import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// PATCH /api/wishlist/[userId]/items/[itemId]/claim - Toggle claim
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string; itemId: string }> }
) {
  try {
    const { itemId } = await params;
    const { claimed_by } = await request.json();

    const { data, error } = await supabase
      .from('wishlist_items')
      .update({ claimed_by, updated_at: new Date().toISOString() })
      .eq('id', itemId)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error toggling claim:', error);
    return NextResponse.json({ error: 'Failed to toggle claim' }, { status: 500 });
  }
}
