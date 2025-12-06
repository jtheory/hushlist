'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { supabase, User, WishlistItem } from '@/lib/supabase';

export default function WishlistPage() {
  const { user: currentUser, loading: authLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const userId = params.userId as string;

  const [wishlistOwner, setWishlistOwner] = useState<User | null>(null);
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [newItemText, setNewItemText] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');

  const isOwnList = currentUser?.id === userId;

  useEffect(() => {
    if (!authLoading && !currentUser) {
      router.push('/login');
    }
  }, [currentUser, authLoading, router]);

  useEffect(() => {
    const fetchData = async () => {
      // Fetch wishlist owner
      const { data: owner, error: ownerError } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (ownerError) {
        console.error('Error fetching user:', ownerError);
        setLoading(false);
        return;
      }

      setWishlistOwner(owner);

      // Fetch wishlist items
      const { data: itemsData, error: itemsError } = await supabase
        .from('wishlist_items')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (itemsError) {
        console.error('Error fetching items:', itemsError);
      } else {
        setItems(itemsData || []);
      }

      setLoading(false);
    };

    if (currentUser && userId) {
      fetchData();
    }
  }, [currentUser, userId]);

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemText.trim() || !currentUser) return;

    const { data, error } = await supabase
      .from('wishlist_items')
      .insert([{ user_id: userId, item_text: newItemText.trim() }])
      .select()
      .single();

    if (error) {
      console.error('Error adding item:', error);
    } else {
      setItems([data, ...items]);
      setNewItemText('');
    }
  };

  const handleDeleteItem = async (itemId: string) => {
    const { error } = await supabase
      .from('wishlist_items')
      .delete()
      .eq('id', itemId);

    if (error) {
      console.error('Error deleting item:', error);
    } else {
      setItems(items.filter(item => item.id !== itemId));
    }
  };

  const handleEditItem = async (itemId: string) => {
    if (!editText.trim()) return;

    const { data, error } = await supabase
      .from('wishlist_items')
      .update({ item_text: editText.trim(), updated_at: new Date().toISOString() })
      .eq('id', itemId)
      .select()
      .single();

    if (error) {
      console.error('Error updating item:', error);
    } else {
      setItems(items.map(item => item.id === itemId ? data : item));
      setEditingId(null);
      setEditText('');
    }
  };

  const handleToggleClaim = async (item: WishlistItem) => {
    if (!currentUser) return;

    const newClaimedBy = item.claimed_by ? null : currentUser.id;

    const { data, error } = await supabase
      .from('wishlist_items')
      .update({ claimed_by: newClaimedBy, updated_at: new Date().toISOString() })
      .eq('id', item.id)
      .select()
      .single();

    if (error) {
      console.error('Error toggling claim:', error);
    } else {
      setItems(items.map(i => i.id === item.id ? data : i));
    }
  };

  const startEdit = (item: WishlistItem) => {
    setEditingId(item.id);
    setEditText(item.item_text);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditText('');
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Loading...</p>
      </div>
    );
  }

  if (!currentUser || !wishlistOwner) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4">
        <div className="mb-6">
          <button
            onClick={() => router.push('/dashboard')}
            className="text-indigo-600 hover:text-indigo-800 flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Dashboard
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h1 className="text-2xl font-bold text-gray-900">
              {wishlistOwner.name}&apos;s Wishlist
              {isOwnList && <span className="text-lg font-normal text-gray-600 ml-2">(Your List)</span>}
            </h1>
          </div>

          <div className="p-6">
            <form onSubmit={handleAddItem} className="mb-6">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newItemText}
                  onChange={(e) => setNewItemText(e.target.value)}
                  placeholder="Add a new item..."
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <button
                  type="submit"
                  className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  Add
                </button>
              </div>
            </form>

            {items.length === 0 ? (
              <p className="text-center text-gray-500 py-8">
                No items yet. {isOwnList ? 'Add your first wish!' : 'Be the first to add something!'}
              </p>
            ) : (
              <div className="space-y-3">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg"
                  >
                    {!isOwnList && (
                      <input
                        type="checkbox"
                        checked={!!item.claimed_by}
                        onChange={() => handleToggleClaim(item)}
                        className="w-5 h-5 text-indigo-600 rounded focus:ring-indigo-500"
                        title={item.claimed_by ? "Already claimed" : "Click to claim"}
                      />
                    )}

                    <div className="flex-1">
                      {editingId === item.id ? (
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={editText}
                            onChange={(e) => setEditText(e.target.value)}
                            className="flex-1 px-3 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            autoFocus
                          />
                          <button
                            onClick={() => handleEditItem(item.id)}
                            className="px-3 py-1 bg-indigo-600 text-white text-sm rounded-md hover:bg-indigo-700"
                          >
                            Save
                          </button>
                          <button
                            onClick={cancelEdit}
                            className="px-3 py-1 bg-gray-300 text-gray-700 text-sm rounded-md hover:bg-gray-400"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <p className="text-gray-900">{item.item_text}</p>
                      )}
                    </div>

                    {editingId !== item.id && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => startEdit(item)}
                          className="text-gray-600 hover:text-indigo-600"
                          title="Edit"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDeleteItem(item.id)}
                          className="text-gray-600 hover:text-red-600"
                          title="Delete"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
