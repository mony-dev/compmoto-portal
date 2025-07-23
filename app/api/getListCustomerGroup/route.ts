import { NextResponse } from 'next/server';
import { prisma } from '@lib/prisma'; 

export async function GET(request: Request) {
  try {
    const [customerGroups, total] = await Promise.all([
      prisma.customerGroup.findMany(),
      prisma.customerGroup.count(),
    ]);

    return NextResponse.json({ customerGroups, total });
  } catch (error: any) {
    console.error('API Error:', error);
    return NextResponse.json({ error: error.message || 'Unknown error' }, { status: 500 });
  }
}
