'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { User, WishlistItem } from '@/lib/supabase';

export default function WishlistPage() {
  const { user: currentUser, loading: authLoading, updateUser } = useAuth();
  const router = useRouter();
  const params = useParams();
  const userId = params.userId as string;

  const [wishlistOwner, setWishlistOwner] = useState<User | null>(null);
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [newItemText, setNewItemText] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const [editingName, setEditingName] = useState(false);
  const [editNameText, setEditNameText] = useState('');
  const [bulkAddMode, setBulkAddMode] = useState(false);
  const [bulkText, setBulkText] = useState('');

  const isOwnList = currentUser?.id === userId;

  useEffect(() => {
    if (!authLoading && !currentUser) {
      router.push('/login');
    }
  }, [currentUser, authLoading, router]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`/api/wishlist/${userId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch wishlist');
        }
        const { owner, items } = await response.json();
        setWishlistOwner(owner);
        setItems(items);
      } catch (error) {
        console.error('Error fetching wishlist:', error);
      } finally {
        setLoading(false);
      }
    };

    if (currentUser && userId) {
      fetchData();
    }
  }, [currentUser, userId]);

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemText.trim() || !currentUser) return;

    try {
      const response = await fetch(`/api/wishlist/${userId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ item_text: newItemText.trim() }),
      });

      if (!response.ok) {
        throw new Error('Failed to add item');
      }

      const data = await response.json();
      setItems([data, ...items]);
      setNewItemText('');
    } catch (error) {
      console.error('Error adding item:', error);
    }
  };

  const handleDeleteItem = async (itemId: string) => {
    try {
      const response = await fetch(`/api/wishlist/${userId}/items/${itemId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete item');
      }

      setItems(items.filter(item => item.id !== itemId));
    } catch (error) {
      console.error('Error deleting item:', error);
    }
  };

  const handleEditItem = async (itemId: string) => {
    if (!editText.trim()) return;

    try {
      const response = await fetch(`/api/wishlist/${userId}/items/${itemId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ item_text: editText.trim() }),
      });

      if (!response.ok) {
        throw new Error('Failed to update item');
      }

      const data = await response.json();
      setItems(items.map(item => item.id === itemId ? data : item));
      setEditingId(null);
      setEditText('');
    } catch (error) {
      console.error('Error updating item:', error);
    }
  };

  const handleToggleClaim = async (item: WishlistItem) => {
    if (!currentUser) return;

    const newClaimedBy = item.claimed_by ? null : currentUser.id;

    try {
      const response = await fetch(`/api/wishlist/${userId}/items/${item.id}/claim`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ claimed_by: newClaimedBy }),
      });

      if (!response.ok) {
        throw new Error('Failed to toggle claim');
      }

      const data = await response.json();
      setItems(items.map(i => i.id === item.id ? data : i));
    } catch (error) {
      console.error('Error toggling claim:', error);
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

  const handleEditName = async () => {
    if (!editNameText.trim() || !wishlistOwner) return;

    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: editNameText.trim() }),
      });

      if (!response.ok) {
        throw new Error('Failed to update name');
      }

      const data = await response.json();
      setWishlistOwner(data);

      // Update auth context if editing your own name
      if (isOwnList) {
        updateUser(data);
      }

      setEditingName(false);
      setEditNameText('');
    } catch (error) {
      console.error('Error updating name:', error);
    }
  };

  const startEditName = () => {
    setEditingName(true);
    setEditNameText(wishlistOwner?.name || '');
  };

  const cancelEditName = () => {
    setEditingName(false);
    setEditNameText('');
  };

  const handleBulkAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bulkText.trim() || !currentUser) return;

    const lines = bulkText
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0);

    if (lines.length === 0) return;

    try {
      // Add all items in parallel
      const promises = lines.map(line =>
        fetch(`/api/wishlist/${userId}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ item_text: line }),
        })
      );

      const responses = await Promise.all(promises);
      const newItems = await Promise.all(
        responses.map(response => {
          if (!response.ok) {
            throw new Error('Failed to add item');
          }
          return response.json();
        })
      );

      setItems([...newItems, ...items]);
      setBulkText('');
      setBulkAddMode(false);
    } catch (error) {
      console.error('Error adding items:', error);
    }
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
            Back to dashboard
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            {editingName ? (
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={editNameText}
                  onChange={(e) => setEditNameText(e.target.value)}
                  className="text-2xl font-bold px-3 py-1 border border-gray-300 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  autoFocus
                />
                <button
                  onClick={handleEditName}
                  className="px-4 py-2 bg-indigo-600 text-white text-sm rounded-md hover:bg-indigo-700"
                >
                  Save
                </button>
                <button
                  onClick={cancelEditName}
                  className="px-4 py-2 bg-gray-300 text-gray-700 text-sm rounded-md hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-gray-900">
                  {wishlistOwner.name}&apos;s wishlist
                  {isOwnList && <span className="text-lg font-normal text-gray-600 ml-2">(your list)</span>}
                </h1>
                <button
                  onClick={startEditName}
                  className="text-gray-600 hover:text-indigo-600"
                  title="Edit name"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
              </div>
            )}
          </div>

          <div className="p-6">
            <div className="mb-4 flex justify-end">
              <button
                onClick={() => {
                  setBulkAddMode(!bulkAddMode);
                  setBulkText('');
                  setNewItemText('');
                }}
                className="text-sm text-indigo-600 hover:text-indigo-800"
              >
                {bulkAddMode ? 'Switch to single item' : 'Add multiple items'}
              </button>
            </div>

            {bulkAddMode ? (
              <form onSubmit={handleBulkAdd} className="mb-6">
                <textarea
                  value={bulkText}
                  onChange={(e) => setBulkText(e.target.value)}
                  placeholder="Paste your list here (one item per line)..."
                  rows={8}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 mb-2"
                />
                <div className="flex gap-2 justify-end">
                  <button
                    type="button"
                    onClick={() => {
                      setBulkAddMode(false);
                      setBulkText('');
                    }}
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    Add All
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleAddItem} className="mb-6">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newItemText}
                    onChange={(e) => setNewItemText(e.target.value)}
                    placeholder="Add a new item..."
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <button
                    type="submit"
                    className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    Add
                  </button>
                </div>
              </form>
            )}

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
                            className="flex-1 px-3 py-1 border border-gray-300 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
