import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// GET /api/wishlist/[userId] - Fetch wishlist owner and items
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;

    // Fetch wishlist owner
    const { data: owner, error: ownerError } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (ownerError) {
      throw ownerError;
    }

    // Fetch wishlist items
    const { data: items, error: itemsError } = await supabase
      .from('wishlist_items')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (itemsError) {
      throw itemsError;
    }

    return NextResponse.json({ owner, items });
  } catch (error) {
    console.error('Error fetching wishlist:', error);
    return NextResponse.json({ error: 'Failed to fetch wishlist' }, { status: 500 });
  }
}

// POST /api/wishlist/[userId] - Add new wishlist item
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;
    const { item_text } = await request.json();

    const { data, error } = await supabase
      .from('wishlist_items')
      .insert([{ user_id: userId, item_text }])
      .select()
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error adding item:', error);
    return NextResponse.json({ error: 'Failed to add item' }, { status: 500 });
  }
}
