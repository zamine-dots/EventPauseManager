import { NextRequest, NextResponse } from 'next/server';
import { createParticipant } from '@/db/init';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, food_order, coffee_order, qr_code } = body;

    if (!name || !food_order || !coffee_order) {
      return NextResponse.json(
        { error: 'Missing required fields: name, food_order, coffee_order' },
        { status: 400 }
      );
    }

    const participant = createParticipant({
      name,
      food_order,
      coffee_order,
      qr_code: qr_code || undefined,
    });

    return NextResponse.json(participant, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create participant' },
      { status: 500 }
    );
  }
}
