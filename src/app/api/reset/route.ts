import { NextRequest, NextResponse } from 'next/server';
import { resetAllStatus } from '@/db/init';

export async function POST(request: NextRequest) {
  try {
    resetAllStatus();
    return NextResponse.json(
      { message: 'All statuses reset' },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to reset statuses' },
      { status: 500 }
    );
  }
}
