import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";

const prisma = new PrismaClient();

export async function PUT(request: Request) {
  try {
    const data = await request.json();
    const { userId, rewardPointId, loyaltyPoint } = data;

    if (!userId || !rewardPointId) {
      return NextResponse.json(
        { error: "ID is required for updating" },
        { status: 400 }
      );
    }

    let record = await prisma.rewardPointHistory.findFirst({
      where: {
        userId,
        rewardPointId,
      },
    });

    if (!record) {
      record = await prisma.rewardPointHistory.create({
        data: {
          userId: userId,
          rewardPointId: rewardPointId,
          point: 0,
          incentivePoint: 0,
          loyaltyPoint: 0,
          totalPoint: 0,
          usedPoint: 0,
          totalSpend: 0,
        },
      });
    }

    const updated = await prisma.rewardPointHistory.update({
      where: {
        id: record.id,
      },
      data: {
        loyaltyPoint,
        totalPoint: (record.totalPoint - record.loyaltyPoint) + loyaltyPoint,
      },
    });

    return NextResponse.json({ updated });
  } catch (error) {
    return NextResponse.json({ error: "An error occurred" }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
