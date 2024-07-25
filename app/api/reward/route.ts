import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";
const prisma = new PrismaClient();

export async function POST( request: Request,
  { body }: {  body: any }) {
  const data = await request.json();
  try {
    const createCate = await prisma.reward.create({
      data: {
        name: data.name,
        point: data.point,
        startDate: data.startDate,
        endDate: data.endDate,
        rewardCategoryId: Number(data.rewardCategoryId),
        image: data.image,
        file: data.file,
      }
    })
    return NextResponse.json(createCate);
  } catch (error) {
    return NextResponse.json(error);
  } finally {
    await prisma.$disconnect();
  }
}

   
export async function GET() {
  try {
    const reward = await prisma.reward.findMany({});
    return NextResponse.json(reward);
  } catch (error) {
    return NextResponse.json(error);
  } finally {
    await prisma.$disconnect();
  }
}