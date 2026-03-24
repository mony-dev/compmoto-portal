import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";
const prisma = new PrismaClient();

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q") || "";
  const page = parseInt(searchParams.get("page") || "1");
  const pageSize = parseInt(searchParams.get("pageSize") || "15");
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  try {
    const [rewardCategories, total] = await Promise.all([
      prisma.rewardCategory.findMany({
        where: {
          OR: [{ name: { contains: q }}],
        },
        include: {
          rewards: {
            where: {
              startDate: { lte: today },
              endDate: { gte: today },
            },
          },
        },
        orderBy: [{ createdAt: "desc" }, { id: "desc" }],
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.rewardCategory.count({
        where: {
          OR: [{ name: { contains: q } }],
        },
      }),
    ]);
    return NextResponse.json({ rewardCategories: rewardCategories, total });
  } catch (error) {
    return NextResponse.json(error);
  } finally {
    await prisma.$disconnect();
  }
}