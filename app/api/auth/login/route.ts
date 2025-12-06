import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    // Verify shared password
    const passwordHash = process.env.SHARED_PASSWORD_HASH;

    if (!passwordHash) {
      console.error('SHARED_PASSWORD_HASH environment variable is not set');
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }

    const isValidPassword = await bcrypt.compare(password, passwordHash);

    if (!isValidPassword) {
      return NextResponse.json({ error: 'Invalid password' }, { status: 401 });
    }

    // Check if user exists
    const { data: existingUser, error: fetchError } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') {
      // PGRST116 is "not found" error
      throw fetchError;
    }

    if (existingUser) {
      return NextResponse.json(existingUser);
    }

    // Check if new users are allowed
    const { data: settings, error: settingsError } = await supabase
      .from('settings')
      .select('allow_new_users')
      .eq('id', 1)
      .single();

    if (settingsError) {
      console.error('Error fetching settings:', settingsError);
      // Default to allowing new users if settings can't be fetched
    }

    if (settings && !settings.allow_new_users) {
      return NextResponse.json({ error: 'New user registration is currently disabled' }, { status: 403 });
    }

    // User doesn't exist, create new user
    // Extract name from email (before @)
    const name = email.split('@')[0];

    const { data: newUser, error: insertError } = await supabase
      .from('users')
      .insert([{ email, name }])
      .select()
      .single();

    if (insertError) {
      throw insertError;
    }

    return NextResponse.json(newUser);
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Login failed' }, { status: 500 });
  }
}
