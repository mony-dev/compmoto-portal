import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";
const prisma = new PrismaClient();

// export async function GET(request: Request) {
//     const { searchParams } = new URL(request.url);
//     const group = searchParams.get('group') || '';
//     try {
//       const products = await prisma.promotion.findMany({
//         where: {
//           isActive: true,
//           customerGroupId: Number(group)
//         },
//       });
//       return NextResponse.json(products);
//     } catch (error) {
//       return NextResponse.json(error);
//     } finally {
//       await prisma.$disconnect();
//     }
//   }
  
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const group = searchParams.get("group");

  const todayStr = new Intl.DateTimeFormat("sv-SE", {
    timeZone: "Asia/Bangkok",
  }).format(new Date());

  const startOfToday = new Date(`${todayStr}T00:00:00+07:00`);
  const endOfToday = new Date(`${todayStr}T23:59:59.999+07:00`);

  try {
    const products = await prisma.promotion.findMany({
      where: {
        isActive: true,
        startDate: {
          lte: endOfToday,
        },
        endDate: {
          gte: startOfToday,
        },
        ...(group ? { customerGroupId: Number(group) } : {}),
      },
    });

    return NextResponse.json(products);
  } catch (error) {
    return NextResponse.json(error);
  } finally {
    await prisma.$disconnect();
  }
}