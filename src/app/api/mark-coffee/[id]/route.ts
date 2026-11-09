import { NextRequest, NextResponse } from 'next/server';
import { markCoffeeTaken } from '@/db/init';

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const participant = markCoffeeTaken(id);

    if (!participant) {
      return NextResponse.json(
        { error: 'Participant not found' },
        { status: 404 }
      );
    }

    if (participant.coffee_taken) {
      return NextResponse.json(
        { message: 'Coffee marked as taken', participant },
        { status: 200 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to mark coffee as taken' },
      { status: 500 }
    );
  } catch {
    return NextResponse.json(
      { error: 'Failed to mark coffee as taken' },
      { status: 500 }
    );
  }
}
