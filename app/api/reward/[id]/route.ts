import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";
const prisma = new PrismaClient();

interface dataBodyInterface {
  name: string;
  point: number;
  startDate: string;
  endDate: string;
  image: string;
  file: string;
}

export async function GET(
  request: Request,
  { params }: { params: { id: number } }
) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q") || "";
  const id = params.id;
  try {
    const reward = await prisma.reward.findUnique({
      where: {
        id: Number(id),
      },
    });
    return NextResponse.json(reward);
  } catch (error) {
    return NextResponse.json(error);
  } finally {
    await prisma.$disconnect();
  }
}

export async function PUT(
  request: Request,
  { params, body }: { params: { id: number }; body: any }
) {
  const data = await request.json();
  const id = params.id;

  let dataBody: dataBodyInterface = {
    name: data.name,
    point: data.point,
    startDate: data.startDate,
    endDate: data.endDate,
    image: data.image,
    file: data.file,
  };

  try {
    const updatedCategory = await prisma.reward.update({
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
    const deletedReward = await prisma.reward.delete({
      where: {
        id: Number(id),
      },
    });
    return NextResponse.json(deletedReward);
  } catch (error) {
    return NextResponse.json(error);
  } finally {
    await prisma.$disconnect();
  }
}
