import { Resend } from 'resend';
import { createClient } from '@supabase/supabase-js';

declare global {
  var __OTP_STORE__: Map<string, { code: string; expiresAt: number }> | undefined;
}
if (!globalThis.__OTP_STORE__) {
  globalThis.__OTP_STORE__ = new Map();
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

    // 1. Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // 2. Save in in-memory fallback
    globalThis.__OTP_STORE__?.set(email, {
      code: otp,
      expiresAt: Date.now() + 10 * 60 * 1000,
    });

    // 3. Send OTP via Resend API using RESEND_API_KEY from env
    const resendApiKey = process.env.RESEND_API_KEY;
    if (resendApiKey) {
      try {
        const resend = new Resend(resendApiKey);
        await resend.emails.send({
          from: 'UniNest <onboarding@resend.dev>',
          to: email,
          subject: `Your UniNest code is ${otp}`,
          html: `
            <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px 24px; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px;">
              <div style="text-align: center; margin-bottom: 24px;">
                <h1 style="color: #0A1931; font-size: 24px; font-weight: 900; margin: 0;">UniNest</h1>
                <p style="color: #64748b; font-size: 13px; margin-top: 4px;">Making Nigerian Students Comfortable</p>
              </div>
              <p style="color: #334155; font-size: 15px; line-height: 1.5;">Your UniNest verification code is:</p>
              <div style="background-color: #FFF7ED; border: 2px dashed #FF6A00; padding: 20px; text-align: center; border-radius: 12px; margin: 24px 0;">
                <span style="font-size: 36px; font-weight: 900; letter-spacing: 8px; color: #FF6A00; font-family: monospace;">${otp}</span>
              </div>
              <p style="color: #64748b; font-size: 13px; line-height: 1.5;">This code will expire in 10 minutes. If you did not request this login code, you can safely ignore this email.</p>
              <hr style="border: none; border-top: 1px solid #f1f5f9; margin: 24px 0;" />
              <p style="color: #94a3b8; font-size: 11px; text-align: center; margin: 0;">&copy; ${new Date().getFullYear()} UniNest Nigeria. All rights reserved.</p>
            </div>
          `,
        });
      } catch (emailErr: any) {
        console.warn('Resend email send error:', emailErr?.message || emailErr);
      }
    } else {
      console.warn('RESEND_API_KEY is not defined in environment variables. OTP generated:', otp);
    }

    // 4. Store OTP in Supabase table otp_codes
    try {
      const supabase = getSupabaseClient();
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();
      await supabase
        .from('otp_codes')
        .upsert([
          {
            email,
            code: otp,
            otp: otp,
            created_at: new Date().toISOString(),
            expires_at: expiresAt,
          }
        ], { onConflict: 'email' });
    } catch (dbErr: any) {
      console.warn('Supabase otp_codes save warning:', dbErr?.message);
    }

    return new Response(JSON.stringify({ 
      otp, 
      success: true, 
      message: 'OTP sent successfully' 
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    console.error('Error in send-otp route:', error);
    return new Response(JSON.stringify({ error: error.message || 'Failed to send OTP' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
