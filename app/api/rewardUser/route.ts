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

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId") || "";
  const q = searchParams.get("q") || "";

  try {
    if (userId) {
      const rewards = await prisma.userReward.findMany({
        where: { userId: Number(userId) },
        include: { reward: true },
      });
      return NextResponse.json(rewards);
    } else {
      const rewards = await prisma.userReward.findMany({
        include: { reward: true, user: true },
      });
      return NextResponse.json(rewards);
    }
  } catch (error) {
    return NextResponse.json(error);
  } finally {
    await prisma.$disconnect();
  }
}
