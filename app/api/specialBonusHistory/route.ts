// api/specialBonusHistory.ts

import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const specialBonusId = searchParams.get('specialBonusId');

    
    const page = 1;
    const pageSize = 50;
    if (!userId || !specialBonusId) {
        return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }
    try {
      const [specialBonusHistory] = await Promise.all([
        prisma.specialBonusHistory.findMany({
            where: {
                userId: parseInt(userId),
                specialBonusId: parseInt(specialBonusId)
            },
            skip: (page - 1) * pageSize,
            take: pageSize,
        }),
      ]);
      return NextResponse.json({ data: specialBonusHistory, total: 1 });
    } catch (error) {
      return NextResponse.json(error);
    } finally {
      await prisma.$disconnect();
    }
  }