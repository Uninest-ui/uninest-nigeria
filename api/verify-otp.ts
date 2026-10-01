import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || 'https://mqvzkbzfusqrarmwuwwe.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_qBq-rRzVkx0gbpof1p6MfA_9gK0rdE5';

const supabase = createClient(supabaseUrl, supabaseKey);

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email, otp, code } = req.body || {};
    const cleanEmail = (email || '').trim().toLowerCase();
    const enteredOtp = (otp || code || '').trim();

    if (!cleanEmail || !enteredOtp) {
      return res.status(400).json({ error: 'Email and OTP are required' });
    }

    // Verify OTP from Supabase table otp_codes
    const { data, error } = await supabase
      .from('otp_codes')
      .select('*')
      .eq('email', cleanEmail)
      .order('created_at', { ascending: false })
      .limit(1);

    if (error) {
      console.warn('Error reading from otp_codes:', error.message);
    }

    const record = data && data[0];
    const storedCode = record?.code || record?.otp;

    if (!storedCode || String(storedCode).trim() !== enteredOtp) {
      return res.status(400).json({ 
        error: 'Invalid or incorrect 6-digit OTP code. Please check your email or request a new code.', 
        valid: false,
        success: false 
      });
    }

    // Successfully verified, clean up used record
    try {
      await supabase.from('otp_codes').delete().eq('email', cleanEmail);
    } catch (delErr: any) {
      console.warn('Warning deleting verified otp_code:', delErr?.message);
    }

    return res.status(200).json({ 
      success: true, 
      verified: true, 
      message: 'OTP verified successfully' 
    });
  } catch (error: any) {
    console.error('Error in verify-otp api handler:', error);
    return res.status(500).json({ error: error.message || 'Failed to verify OTP' });
  }
}
