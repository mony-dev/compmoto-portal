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
    const deletedCate = await prisma.rewardCategory.delete({
      where: {
        id: Number(id),
      },
    });
    return NextResponse.json(deletedCate);
  } catch (error) {
    return NextResponse.json(error);
  } finally {
    await prisma.$disconnect();
  }
}
