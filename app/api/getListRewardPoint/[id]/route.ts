import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";
const prisma = new PrismaClient();

// export async function GET(
//   request: Request,
//   { params }: { params: { id: number } }
// ) {
//   const id = Number(params.id);

//   try {
//     const record = await prisma.rewardPoint.findFirst({
//       where: {
//         customerGroupId: id,
//         isFinalize: true,
//       },
//     });

//     const found = !!record; // convert to boolean
//     return NextResponse.json({ found: found, id: record?.id });
//   } catch (error) {
//     console.error("Error fetching reward point:", error);
//     return NextResponse.json(
//       { error: "Internal Server Error" },
//       { status: 500 }
//     );
//   } finally {
//     await prisma.$disconnect();
//   }
// }

export async function GET(
  request: Request,
  { params }: { params: { id: number } }
) {
  const id = Number(params.id);

  try {
    const [rewardPoint, totalPurchase, specialBonus] = await Promise.all([
      prisma.rewardPoint.findFirst({
        where: {
          customerGroupId: id,
          isFinalize: true,
        },
        select: {
          id: true,
        },
      }),
      prisma.totalPurchase.findFirst({
        where: {
          customerGroupId: id,
          isActive: true,
        },
        select: {
          id: true,
          name: true,
        },
      }),
      prisma.specialBonus.findFirst({
        where: {
          customerGroupId: id,
          isActive: true,
        },
        select: {
          id: true,
          name: true,
        },
      }),
    ]);

    return NextResponse.json({
      found: !!rewardPoint,
      id: rewardPoint?.id ?? null,
      totalPurchase: totalPurchase ?? null,
      specialBonus: specialBonus ?? null,
    });
  } catch (error) {
    console.error("Error fetching data:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}