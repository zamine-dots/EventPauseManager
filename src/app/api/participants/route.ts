import { NextRequest, NextResponse } from 'next/server';
import { getAllParticipants } from '@/db/init';

export async function GET(request: NextRequest) {
  try {
    const participants = getAllParticipants();
    return NextResponse.json(participants, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch participants' },
      { status: 500 }
    );
  }
}
