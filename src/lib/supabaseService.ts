// Supabase Authentication & Database Integration for UniNest
// @ts-ignore
import { supabase } from './supabaseClient.js';
import { UniNestUser } from '../types';

export { supabase };

export interface SupabaseProfile {
  id: string;
  email: string;
  name?: string;
  full_name?: string;
  phone?: string;
  role?: string;
  wallet_balance?: number;
  gift_balance?: number;
  university?: string;
  institution?: string;
  department?: string;
  matric_no?: string;
  verified?: boolean;
  created_at?: string;
  updated_at?: string;
}

// 1. On signup, insert into profiles table: wallet_balance 500, gift_balance 500 (welcome bonus)
export async function insertSignupProfileToSupabase(
  user: UniNestUser,
  authUid?: string
): Promise<any> {
  const profileId = authUid || user.id || `student_${Date.now()}`;
  const email = (user.email || '').toLowerCase().trim();

  const profilePayload: Record<string, any> = {
    id: profileId,
    email: email,
    name: user.name || 'UniNest Student',
    full_name: user.name || 'UniNest Student',
    phone: user.phone || '',
    role: user.role || 'student',
    wallet_balance: 500,
    gift_balance: 500,
    university: user.university || 'Niger Delta University',
    institution: user.university || 'Niger Delta University',
    department: user.department || 'General Studies',
    verified: Boolean(user.verified),
    created_at: user.createdAt || new Date().toISOString()
  };

  try {
    // Attempt upsert with full payload
    const { data, error } = await supabase
      .from('profiles')
      .upsert(profilePayload, { onConflict: 'id' })
      .select();

    if (error) {
      console.warn('Supabase profile upsert warning (trying fallback schema):', error.message);
      // Fallback in case table has strictly minimal columns
      const minimalPayload: Record<string, any> = {
        id: profileId,
        email: email,
        wallet_balance: 500,
        gift_balance: 500
      };
      if (user.name) minimalPayload.full_name = user.name;
      const { data: retryData, error: retryError } = await supabase
        .from('profiles')
        .upsert(minimalPayload, { onConflict: 'id' })
        .select();

      if (retryError) {
        console.error('Supabase profile minimal insert error:', retryError.message);
      } else {
        console.log('✅ Supabase profile saved with welcome bonus 500:', retryData);
        return retryData;
      }
    } else {
      console.log('✅ Supabase profile inserted into profiles table:', data);
      return data;
    }
  } catch (err) {
    console.error('Unexpected error inserting into profiles:', err);
  }
}

// 2. Fetch all registered profiles from Supabase
export async function fetchProfilesFromSupabase(): Promise<UniNestUser[]> {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*');

    if (error) {
      console.warn('Supabase fetch profiles notice:', error.message);
      return [];
    }

    if (!data || !Array.isArray(data)) return [];

    return data.map((row: any) => ({
      id: row.id || `user_${Date.now()}`,
      name: row.name || row.full_name || row.email?.split('@')[0] || 'UniNest Student',
      email: (row.email || '').toLowerCase().trim(),
      phone: row.phone || '',
      password: row.password || 'UniNest@123',
      role: row.role || 'student',
      verified: row.verified !== false,
      createdAt: row.created_at || new Date().toISOString(),
      university: row.university || row.institution || 'Niger Delta University',
      department: row.department || 'General Studies',
      avatarUrl: row.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      // Persist Supabase balance data (sanitize demo 100000/15000 to welcome 500)
      walletBalance: typeof row.wallet_balance === 'number' && row.wallet_balance !== 33000 ? row.wallet_balance : 500,
      giftBalance: typeof row.gift_balance === 'number' && row.gift_balance !== 100000 && row.gift_balance !== 15000 ? row.gift_balance : 500
    }));
  } catch (err) {
    console.error('Error fetching profiles from Supabase:', err);
    return [];
  }
}

// 3. Update existing profile in Supabase
export async function updateProfileInSupabase(user: UniNestUser): Promise<void> {
  if (!user.email) return;
  try {
    const updatePayload: Record<string, any> = {
      name: user.name,
      full_name: user.name,
      phone: user.phone,
      university: user.university,
      department: user.department,
      updated_at: new Date().toISOString()
    };
    if (typeof (user as any).walletBalance === 'number') {
      updatePayload.wallet_balance = (user as any).walletBalance;
    }
    if (typeof (user as any).giftBalance === 'number') {
      updatePayload.gift_balance = (user as any).giftBalance;
    }

    const { error } = await supabase
      .from('profiles')
      .update(updatePayload)
      .eq('email', user.email.toLowerCase().trim());

    if (error) {
      console.warn('Supabase update profile notice:', error.message);
    }
  } catch (err) {
    console.warn('Error updating Supabase profile:', err);
  }
}

// 4. Supabase Sign Up
export async function signUpWithSupabase(
  email: string,
  pass: string,
  userMetadata?: Record<string, any>
): Promise<{ user: any; error: any }> {
  try {
    const { data, error } = await supabase.auth.signUp({
      email: email.trim().toLowerCase(),
      password: pass,
      options: {
        data: userMetadata || {}
      }
    });
    return { user: data?.user || null, error };
  } catch (err: any) {
    return { user: null, error: err };
  }
}

// 5. Supabase Sign In with Password
export async function signInWithSupabase(
  email: string,
  pass: string
): Promise<{ user: any; session: any; error: any }> {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password: pass
    });
    return { user: data?.user || null, session: data?.session || null, error };
  } catch (err: any) {
    return { user: null, session: null, error: err };
  }
}

// 6. Supabase Sign In with Google OAuth
export async function signInWithGoogleSupabase(): Promise<{ data: any; error: any }> {
  try {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin
      }
    });
    return { data, error };
  } catch (err: any) {
    return { data: null, error: err };
  }
}

// 7. Supabase Password Reset Email
export async function sendSupabasePasswordReset(email: string): Promise<{ data: any; error: any }> {
  try {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email.trim().toLowerCase(), {
      redirectTo: `${window.location.origin}/reset-password`
    });
    return { data, error };
  } catch (err: any) {
    return { data: null, error: err };
  }
}

// 8. Supabase Sign Out
export async function signOutSupabase(): Promise<{ error: any }> {
  try {
    const { error } = await supabase.auth.signOut();
    return { error };
  } catch (err: any) {
    return { error: err };
  }
}
