import { Prisma, PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";
const prisma = new PrismaClient();

const THAI_MONTHS = [
  '', 'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
  'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม',
];

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q") || "";
  const page = parseInt(searchParams.get("page") || "1");
  const pageSize = parseInt(searchParams.get("pageSize") || "1000");
  const isFinalize = searchParams.get("isFinalize"); // optional filter (e.g. "true" or "false")
  const month = searchParams.get("month");
  const year = searchParams.get("year");
  const dateParam = searchParams.get("date");
  const date = dateParam ? dateParam === "true" : false;

  try {
    const where: Prisma.RewardPointWhereInput = {
      ...(q && {
        name: {
          contains: q,
          mode: Prisma.QueryMode.insensitive,
        },
      }),
      ...(isFinalize !== null && isFinalize !== "all" && {
        isFinalize: isFinalize === "true",
      }),
      ...(date && month && year && {
        month: Number(month),
        year: Number(year),
      }),
    };

    const [rewardPoints, total] = await Promise.all([
      prisma.rewardPoint.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: {
          customerGroup: true,
          totalPurchase: true,
          specialBonus: true
        },
        orderBy: [
          { year: 'desc' },
          { month: 'desc' },
        ],
      }),
      prisma.rewardPoint.count({ where }),
    ]);
    
    // Add monthYear field
    const transformed = rewardPoints.map((rewardPoint) => ({
      ...rewardPoint,
      monthYear: `${THAI_MONTHS[rewardPoint.month]} ${rewardPoint.year}`,
    }));

    return NextResponse.json({ rewardPoints: transformed, total });
  } catch (error) {
    return NextResponse.json(error);
  } finally {
    await prisma.$disconnect();
  }
}
