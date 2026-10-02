import { createClient } from '@supabase/supabase-js';

function isValidResendApiKey(key?: string): boolean {
  if (!key) return false;
  const clean = key.trim();
  return clean.startsWith('re_') && clean.length >= 25;
}

function getSupabaseConfig() {
  const defaultUrl = 'https://mqvzkbzfusqrarmwuwwe.supabase.co';
  const defaultKey = 'sb_publishable_qBq-rRzVkx0gbpof1p6MfA_9gK0rdE5';

  const rawUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '';
  const rawKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || '';

  let finalUrl = defaultUrl;
  if (rawUrl) {
    const match = rawUrl.match(/https?:\/\/[a-z0-9.-]+\.supabase\.co/i) || rawUrl.match(/https?:\/\/[^\s"']+/i);
    if (match) finalUrl = match[0];
  }

  let finalKey = defaultKey;
  if (rawKey) {
    const match = rawKey.match(/sb_secret_[a-zA-Z0-9_-]+/i) || rawKey.match(/sb_publishable_[a-zA-Z0-9_-]+/i) || rawKey.match(/sb_[^\s"']+/i) || rawKey.match(/eyJ[a-zA-Z0-9._-]+/i);
    if (match) finalKey = match[0];
  }

  return { url: finalUrl, key: finalKey };
}

function getSupabaseClient() {
  const { url, key } = getSupabaseConfig();
  try {
    return createClient(url, key);
  } catch (err) {
    return createClient('https://mqvzkbzfusqrarmwuwwe.supabase.co', 'sb_publishable_qBq-rRzVkx0gbpof1p6MfA_9gK0rdE5');
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const email = (body.email || '').trim().toLowerCase();

    if (!email) {
      return new Response(JSON.stringify({ error: 'Email is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // 1. Generate 6-digit reset code
    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();

    // 2. Send Password Reset code via Resend
    const resendApiKey = process.env.RESEND_API_KEY;
    if (isValidResendApiKey(resendApiKey)) {
      try {
        const response = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${resendApiKey?.trim()}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: 'UniNest <noreply@uninestnigeria.com.ng>',
            to: email,
            subject: `UniNest Password Reset Code: ${resetCode}`,
            html: `
              <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px 24px; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px;">
                <div style="text-align: center; margin-bottom: 24px;">
                  <h1 style="color: #0A1931; font-size: 24px; font-weight: 900; margin: 0;">UniNest</h1>
                  <p style="color: #64748b; font-size: 13px; margin-top: 4px;">Making Nigerian Students Comfortable</p>
                </div>
                <p style="color: #334155; font-size: 15px; line-height: 1.5;">You requested a password reset. Your verification code is:</p>
                <div style="background-color: #FFF7ED; border: 2px dashed #FF6A00; padding: 20px; text-align: center; border-radius: 12px; margin: 24px 0;">
                  <span style="font-size: 36px; font-weight: 900; letter-spacing: 8px; color: #FF6A00; font-family: monospace;">${resetCode}</span>
                </div>
                <p style="color: #64748b; font-size: 13px; line-height: 1.5;">This code will expire in 10 minutes. If you did not request this password reset, please ignore this email.</p>
                <hr style="border: none; border-top: 1px solid #f1f5f9; margin: 24px 0;" />
                <p style="color: #94a3b8; font-size: 11px; text-align: center; margin: 0;">&copy; ${new Date().getFullYear()} UniNest Nigeria. All rights reserved.</p>
              </div>
            `,
          }),
        });

        const resData = await response.json().catch(() => ({}));
        if (!response.ok) {
          console.warn('Resend email dispatch notice (non-fatal):', resData?.message || response.statusText);
        }
      } catch (emailErr: any) {
        console.warn('Resend email dispatch network notice:', emailErr?.message || emailErr);
      }
    }

    // 3. Save to Supabase otp_codes
    try {
      const supabase = getSupabaseClient();
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();
      const record = {
        email,
        code: resetCode,
        otp: resetCode,
        created_at: new Date().toISOString(),
        expires_at: expiresAt,
      };

      const { error: upsertErr } = await supabase
        .from('otp_codes')
        .upsert([record], { onConflict: 'email' });

      if (upsertErr) {
        await supabase.from('otp_codes').insert([record]);
      }
    } catch (dbErr: any) {
      console.warn('Supabase otp_codes save warning:', dbErr?.message);
    }

    return new Response(JSON.stringify({ 
      success: true, 
      message: 'Password reset code sent successfully' 
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    console.error('Error in forgot-password route:', error);
    return new Response(JSON.stringify({ error: error.message || 'Failed to send reset code' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
