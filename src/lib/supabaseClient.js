import { createClient } from '@supabase/supabase-js'

function getSafeSupabaseConfig() {
  const defaultUrl = 'https://mqvzkbzfusqrarmwuwwe.supabase.co';
  const defaultKey = 'sb_publishable_qBq-rRzVkx0gbpof1p6MfA_9gK0rdE5';

  let rawUrl = '';
  let rawKey = '';

  try {
    if (typeof import.meta !== 'undefined' && import.meta.env) {
      rawUrl = import.meta.env.VITE_SUPABASE_URL || '';
      rawKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
    }
  } catch (e) {}

  if (!rawUrl && typeof process !== 'undefined' && process.env) {
    rawUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '';
    rawKey = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || '';
  }

  let finalUrl = defaultUrl;
  if (rawUrl) {
    const match = rawUrl.match(/https?:\/\/[a-z0-9.-]+\.supabase\.co/i) || rawUrl.match(/https?:\/\/[^\s"']+/i);
    if (match) {
      finalUrl = match[0];
    }
  }

  let finalKey = defaultKey;
  if (rawKey) {
    const match = rawKey.match(/sb_[^\s"']+/i) || rawKey.match(/eyJ[a-zA-Z0-9._-]+/i);
    if (match) {
      finalKey = match[0];
    }
  }

  return { url: finalUrl, key: finalKey };
}

const { url, key } = getSafeSupabaseConfig();

let client;
try {
  client = createClient(url, key);
} catch (err) {
  console.warn('Fallback Supabase client initialization:', err);
  client = createClient('https://mqvzkbzfusqrarmwuwwe.supabase.co', 'sb_publishable_qBq-rRzVkx0gbpof1p6MfA_9gK0rdE5');
}

export const supabase = client;
