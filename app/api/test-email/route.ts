import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function GET() {
  await resend.emails.send({
    from: 'Rad Tech Tutor <support@theradtechtutor.com>',
    to: 'jamesbaptiste@yahoo.com',
    subject: 'Test Email',
    html: '<p>Email system is working ✅</p>',
  });

  return Response.json({ success: true });
}