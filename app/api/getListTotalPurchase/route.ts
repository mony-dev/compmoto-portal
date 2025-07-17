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
  const isActive = searchParams.get("isActive"); // optional filter (e.g. "true" or "false")

  try {
    const where: Prisma.TotalPurchaseWhereInput = {
      ...(q && {
        name: {
          contains: q,
          mode: Prisma.QueryMode.insensitive,
        },
      }),
      ...(isActive !== null && isActive !== "all" && {
        isActive: isActive === "true",
      }),
    };

    const [totalPurchases, total] = await Promise.all([
      prisma.totalPurchase.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: {
          customerGroup: true,
          items: true,
        },
        orderBy: [
          { year: 'desc' },
          { month: 'desc' },
        ],
      }),
      prisma.totalPurchase.count({ where }),
    ]);
    
    // Add monthYear field
    const transformed = totalPurchases.map((purchase) => ({
      ...purchase,
      monthYear: `${THAI_MONTHS[purchase.month]} ${purchase.year}`,
    }));

    return NextResponse.json({ totalPurchases: transformed, total });
  } catch (error) {
    return NextResponse.json(error);
  } finally {
    await prisma.$disconnect();
  }
}
