import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";
const prisma = new PrismaClient();

export async function GET(
  request: Request,
  { params }: { params: { id: number } }
) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q") || "";
  const id = params.id;
  try {
    const reward = await prisma.reward.findMany({
      where: {
        AND: [
          {
            rewardCategoryId: { equals: Number(id) },
          },
          {
            OR: [
              { name: { contains: q, mode: 'insensitive' } },
            ],
          },
        ],
      },
    });
    return NextResponse.json(reward);
  } catch (error) {
    return NextResponse.json(error);
  } finally {
    await prisma.$disconnect();
  }
}
