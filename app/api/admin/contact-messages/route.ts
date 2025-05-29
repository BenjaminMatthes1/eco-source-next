import { NextRequest, NextResponse } from 'next/server';
import connect from '@/lib/mongooseClientPromise';
import ContactMsg from '@/models/ContactMsg';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';

/* auth helper */
async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'admin')
    throw NextResponse.json({ error: 'Forbidden' }, { status: 403 });
}

export async function GET() {
  await requireAdmin();
  await connect();
  const msgs = await ContactMsg.find().sort({ createdAt: -1 }).lean();
  return NextResponse.json(msgs);
}

export async function PATCH(req: NextRequest) {
  await requireAdmin();
  const { id } = await req.json();
  await connect();
  await ContactMsg.findByIdAndUpdate(id, { resolved: true });
  return NextResponse.json({ ok: true });
}
