import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { email } = await req.json();
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    const res = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        service_id: process.env.EMAILJS_SERVICE_ID,
        template_id: process.env.EMAILJS_TEMPLATE_ID,
        user_id: process.env.EMAILJS_PUBLIC_KEY,
        accessToken: process.env.EMAILJS_PRIVATE_KEY,
        template_params: {
          otp_code: otp,
          to_email: email,
        }
      })
    });

    if (!res.ok) throw new Error(await res.text());
    return NextResponse.json({ success: true, otp });
  } catch (e:any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
