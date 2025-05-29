import { NextResponse } from 'next/server';
import { sendEmailToSupport, sendEmailToVisitor } from '@/lib/email';      // reuse SES helper
import connectToDatabase from '@/lib/mongooseClientPromise';
import ContactMsg from '@/models/ContactMsg';          // small schema below

export async function POST(req: Request) {
  const { name, email, message } = await req.json();
  if (!name || !email || !message) {
    return NextResponse.json({ error: 'All fields required' }, { status: 400 });
  }

  // 1) store in DB
  await connectToDatabase();
  await ContactMsg.create({ name, email, message });

  // 2) forward to support inbox
  await sendEmailToSupport(
    `New contact request from ${name}`,
    `<p><strong>Email:</strong> ${email}</p><p>${message}</p>`
  );
  await sendEmailToVisitor(
  email,
  'We received your message',
  `<p>Hi ${name},</p><p>Thanks for contacting Eco-Source. Our team will reply within 1–2 business days.</p>`
);

  return NextResponse.json({ ok: true });
}
