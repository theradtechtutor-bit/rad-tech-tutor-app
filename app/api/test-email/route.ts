import { NextResponse } from 'next/server';
import { Resend } from 'resend';

export async function GET() {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { error: 'Missing RESEND_API_KEY' },
      { status: 500 },
    );
  }

  const resend = new Resend(apiKey);

  try {
    const { data, error } = await resend.emails.send({
      from: 'Rad Tech Tutor <support@theradtechtutor.com>',
      to: 'jamesbaptiste@yahoo.com',
      subject: 'Test Email',
      html: '<p>Email system is working ✅</p>',
    });

    if (error) {
      return NextResponse.json({ error }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });
  } catch (err) {
    return NextResponse.json(
      { error: 'Failed to send email' },
      { status: 500 },
    );
  }
}
