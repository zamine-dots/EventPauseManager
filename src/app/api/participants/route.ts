import { NextResponse } from 'next/server';
import { getAllParticipants } from '@/db/init';

export async function GET() {
  try {
    const participants = getAllParticipants();
    return NextResponse.json(participants, { status: 200 });
  } catch {
    return NextResponse.json(
      { error: 'Failed to fetch participants' },
      { status: 500 }
    );
  }
}
