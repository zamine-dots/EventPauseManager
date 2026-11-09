import { NextResponse } from 'next/server';
import { resetAllStatus } from '@/db/init';

export async function POST() {
  try {
    resetAllStatus();
    return NextResponse.json(
      { message: 'All statuses reset' },
      { status: 200 }
    );
  } catch {
    return NextResponse.json(
      { error: 'Failed to reset statuses' },
      { status: 500 }
    );
  }
}
