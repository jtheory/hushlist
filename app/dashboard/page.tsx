'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { User, Settings } from '@/lib/supabase';

export default function DashboardPage() {
  const { user, logout, loading: authLoading } = useAuth();
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [settings, setSettings] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [usersResponse, settingsResponse] = await Promise.all([
          fetch('/api/users'),
          fetch('/api/settings')
        ]);

        if (!usersResponse.ok) {
          throw new Error('Failed to fetch users');
        }
        if (!settingsResponse.ok) {
          throw new Error('Failed to fetch settings');
        }

        const usersData = await usersResponse.json();
        const settingsData = await settingsResponse.json();

        setUsers(usersData);
        setSettings(settingsData);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchData();
    }
  }, [user]);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const handleToggleNewUsers = async () => {
    if (!settings) return;

    try {
      const response = await fetch('/api/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ allow_new_users: !settings.allow_new_users }),
      });

      if (!response.ok) {
        throw new Error('Failed to update settings');
      }

      const updatedSettings = await response.json();
      setSettings(updatedSettings);
    } catch (error) {
      console.error('Error updating settings:', error);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Loading...</p>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">hushlist</h1>
            <p className="text-gray-600 mt-1">Welcome, {user.name}!</p>
          </div>
          <button
            onClick={handleLogout}
            className="px-4 py-2 text-sm text-gray-700 hover:text-gray-900"
          >
            Logout
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Family members</h2>
            <p className="text-sm text-gray-600 mt-1">Click on a name to view their wishlist</p>
          </div>
          <div className="divide-y divide-gray-200">
            {users.map((familyMember) => (
              <button
                key={familyMember.id}
                onClick={() => router.push(`/wishlist/${familyMember.id}`)}
                className="w-full px-6 py-4 text-left hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">
                      {familyMember.name}
                      {familyMember.id === user.id && (
                        <span className="ml-2 text-sm text-gray-500">(you)</span>
                      )}
                    </h3>
                    <p className="text-sm text-gray-600">{familyMember.email}</p>
                  </div>
                  <svg
                    className="w-5 h-5 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Settings</h2>
          </div>
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-medium text-gray-900">Allow more to join?</h3>
                <p className="text-sm text-gray-600 mt-1">
                  When disabled, new accounts cannot be created at login
                </p>
              </div>
              <button
                onClick={handleToggleNewUsers}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  settings?.allow_new_users ? 'bg-indigo-600' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings?.allow_new_users ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
