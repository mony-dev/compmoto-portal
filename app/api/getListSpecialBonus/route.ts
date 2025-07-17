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
    const where: Prisma.SpecialBonusWhereInput = {
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

    const [specialBonuses, total] = await Promise.all([
      prisma.specialBonus.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: {
          customerGroup: true,
          items: {
            include: {
              minisize: true
            }
          },
        },
        orderBy: [
          { year: 'desc' },
          { month: 'desc' },
        ],
      }),
      prisma.specialBonus.count({ where }),
    ]);
    
    // Add monthYear field
    const transformed = specialBonuses.map((bonus) => ({
      ...bonus,
      monthYear: `${THAI_MONTHS[bonus.month]} ${bonus.year}`,
      brands: bonus.items.sort((a, b) => a.order - b.order).reduce((acc: any[], item) => {
        const brandIndex = acc.findIndex((b) => b.minisizeId === item.minisizeId);
        const newItem: any = {
          totalPurchaseAmount: item.totalPurchaseAmount,
          cn: item.cn,
          incentivePoint: item.incentivePoint,
        };

        if (brandIndex > -1) {
          acc[brandIndex].items.push(newItem);
        } else {
          acc.push({
            minisizeId: item.minisizeId,
            color: (item as any).color || null,
            minisizeName: item.minisize.name,
            items: [newItem],
          });
        }

        return acc;
      }, []),
    }));

    return NextResponse.json({ specialBonuses: transformed, total });
  } catch (error) {
    return NextResponse.json(error);
  } finally {
    await prisma.$disconnect();
  }
}
