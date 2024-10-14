import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";
const prisma = new PrismaClient();

export async function GET(
  request: Request,
  { params }: { params: { id: number } }
) {
  const id = params.id; 
  try {
    const rewardCategory = await prisma.rewardCategory.findUnique({
      where: {
        id: Number(id),
      },
    });
    return NextResponse.json(rewardCategory);
  } catch (error) {
    return NextResponse.json(error);
  } finally {
    await prisma.$disconnect();
  }
}

interface dataBodyInterface {
  name: string;
  isActive: boolean;
}

export async function PUT( request: Request,
  { params, body }: { params: { id: number }; body: any }) {
  const data = await request.json();
  const id = params.id;

  let dataBody: dataBodyInterface = {
    name: data.name,
    isActive: data.isActive,
  }
  
  try {
    const updatedCategory = await prisma.rewardCategory.update({
      where: {
        id: Number(id),
      },
      data: dataBody,
    });
    return NextResponse.json(updatedCategory);
  } catch (error) {
    return NextResponse.json(error);
  } finally {
    await prisma.$disconnect();
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: number } }
) {
  const id = params.id;
  try {
    // Check if there are any associated user rewards that would block the deletion
    const relatedUserRewards = await prisma.userReward.findMany({
      where: {
        rewardId: Number(id)
      },
    });

    // If related UserReward entries exist, return an error
    if (relatedUserRewards.length > 0) {
      return NextResponse.json(
        { message: "Cannot delete category because there are user redeem" },
        { status: 500 }
      );
    }

    // Delete associated rewards first
    await prisma.reward.deleteMany({
      where: {
        rewardCategoryId: Number(id),
      },
    });

    // Then delete the reward category
    const deletedCate = await prisma.rewardCategory.delete({
      where: {
        id: Number(id),
      },
    });

    return NextResponse.json(deletedCate);
  } catch (error) {
    console.log("error", error);
    return NextResponse.json({ message: "An error occurred during deletion." }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
