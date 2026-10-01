import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || 'https://mqvzkbzfusqrarmwuwwe.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_qBq-rRzVkx0gbpof1p6MfA_9gK0rdE5';

const supabase = createClient(supabaseUrl, supabaseKey);

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const email = (body.email || '').trim().toLowerCase();
    const enteredOtp = (body.otp || body.code || '').trim();

    if (!email || !enteredOtp) {
      return new Response(JSON.stringify({ error: 'Email and OTP are required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Verify OTP from Supabase table otp_codes
    const { data, error } = await supabase
      .from('otp_codes')
      .select('*')
      .eq('email', email)
      .order('created_at', { ascending: false })
      .limit(1);

    if (error) {
      console.warn('Error reading from otp_codes:', error.message);
    }

    const record = data && data[0];
    const storedCode = record?.code || record?.otp;

    if (!storedCode || String(storedCode).trim() !== enteredOtp) {
      return new Response(JSON.stringify({ 
        error: 'Invalid or incorrect 6-digit OTP code. Please check your email or request a new code.', 
        valid: false,
        success: false 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Successfully verified, clean up used record
    try {
      await supabase.from('otp_codes').delete().eq('email', email);
    } catch (delErr: any) {
      console.warn('Warning deleting verified otp_code:', delErr?.message);
    }

    return new Response(JSON.stringify({ 
      success: true, 
      verified: true, 
      message: 'OTP verified successfully' 
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    console.error('Error in verify-otp route:', error);
    return new Response(JSON.stringify({ error: error.message || 'Failed to verify OTP' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
