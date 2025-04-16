import { NextRequest, NextResponse } from 'next/server';
import { getSubscribedInstructors } from '@/sanity/lib/instructor/getSubscribedInstructors';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get('userId');
  if (!userId) {
    return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
  }
  try {
    const instructors = await getSubscribedInstructors(userId);
    return NextResponse.json({ instructors });
  } catch (e) {
    return NextResponse.json({ error: 'Failed to fetch notifications' }, { status: 500 });
  }
}
