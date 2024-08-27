import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";
const prisma = new PrismaClient();

export async function POST(request: Request, { body }: { body: any }) {
  const data = await request.json();
  try {
    const createRedeem = await prisma.userReward.create({
      data: {
        rewardId: data.rewardId,
        userId: Number(data.userId),
        quantity: data.quantity,
        isComplete: data.isComplete,
      },
    });
    // Retrieve the user's current points
    const user = await prisma.user.findUnique({
      where: { id: Number(data.userId) },
      select: { rewardPoint: true },
    });

    if (!user) {
      throw new Error("User not found");
    }

    // Calculate the new points
    const newPoints = user.rewardPoint - data.point * data.quantity;

    // Update the user's points
    const updatedUser = await prisma.user.update({
      where: { id: Number(data.userId) },
      data: {
        rewardPoint: newPoints,
      },
    });
    return NextResponse.json(createRedeem);
  } catch (error) {
    return NextResponse.json(error);
  } finally {
    await prisma.$disconnect();
  }
}

// export async function GET(request: Request) {
//   const { searchParams } = new URL(request.url);
//   const userId = searchParams.get("userId") || "";
//   const q = searchParams.get("q") || "";
//   const page = parseInt(searchParams.get("page") || "1");
//   const pageSize = parseInt(searchParams.get("pageSize") || "15");
//   try {
//     if (userId) {
//       const [rewardUsers, total] = await Promise.all([
//         prisma.userReward.findMany({
//           where: { userId: Number(userId) },
//           include: { reward: true },
//           skip: (page - 1) * pageSize,
//           take: pageSize,
//         }),
//         prisma.userReward.count({
//           where: { userId: Number(userId) }
//         }),
//       ]);
//       return NextResponse.json({ rewardUsers: rewardUsers, total });
//     } else {
//       const [rewardUsers, total] = await Promise.all([
//         prisma.userReward.findMany({
//           include: { reward: true, user: true },
//           skip: (page - 1) * pageSize,
//           take: pageSize,
//         }),
//         prisma.userReward.count(),
//       ]);
//       return NextResponse.json({ rewardUsers: rewardUsers, total });
//     }
//   } catch (error) {
//     return NextResponse.json(error);
//   } finally {
//     await prisma.$disconnect();
//   }
// }
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId") || "";
  const q = searchParams.get("q") || "";
  const page = parseInt(searchParams.get("page") || "1");
  const pageSize = parseInt(searchParams.get("pageSize") || "15");
  const isComplete = searchParams.get("isComplete"); // Get isComplete parameter from query string

  try {
    const whereConditions: any = {};

    if (userId) {
      whereConditions.userId = Number(userId);
    }

    if (isComplete !== null) {
      // Filter based on the isComplete value, converting it to boolean
      whereConditions.isComplete = isComplete === "true";
    }

    const [rewardUsers, total] = await Promise.all([
      prisma.userReward.findMany({
        where: whereConditions,
        include: { reward: true, user: true },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.userReward.count({
        where: whereConditions,
      }),
    ]);

    return NextResponse.json({ rewardUsers, total });
  } catch (error: any) {
    return NextResponse.json({ error: error.message });
  } finally {
    await prisma.$disconnect();
  }
}