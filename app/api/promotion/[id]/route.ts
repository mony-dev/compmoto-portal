import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";
const prisma = new PrismaClient();

interface dataBodyInterface {
    name: string;
    isActive: boolean;
    minisizeId: number;
    amount: number;
    productRedeem: string;
    userGroup: string;
    startDate: string;
    endDate: string;
    image: string;
}

export async function PUT(
  request: Request,
  { params, body }: { params: { id: number }; body: any }
) {
  const data = await request.json();
  const id = params.id;

  let dataBody: dataBodyInterface = {
      name: data.name,
      isActive: data.isActive,
      amount: data.amount,
      startDate: data.startDate,
      endDate: data.endDate,
      minisizeId: Number(data.minisizeId),
      image: data.image,
      productRedeem: data.productRedeem,
      userGroup: data.userGroup,
  };

  try {
    const updatedPromotion = await prisma.promotion.update({
      where: {
        id: Number(id),
      },
      data: dataBody,
    });
    return NextResponse.json(updatedPromotion);
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
    const deletedPromotion = await prisma.promotion.delete({
      where: {
        id: Number(id),
      },
    });
    return NextResponse.json(deletedPromotion);
  } catch (error) {
    return NextResponse.json(error);
  } finally {
    await prisma.$disconnect();
  }
}
