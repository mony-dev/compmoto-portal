import { NextResponse } from "next/server";
import { OrderType, PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

interface dataBodyInterface {
    documentNo: string;
}

export async function PUT(
  request: Request,
  { params, body }: { params: { id: number }; body: any }
) {
  const data = await request.json();
  const id = params.id;
  let dataBody: dataBodyInterface = {
    documentNo: data.documentNo
  };

  try {
    const updatedOrder = await prisma.order.update({
      where: {
        id: Number(id),
      },
      data: dataBody,
    });
    return NextResponse.json(updatedOrder);
  } catch (error) {
    return NextResponse.json(error);
  } finally {
    await prisma.$disconnect();
  }
}

export async function GET(
  request: Request,
  { params }: { params: { id: number } }
) {
  const { searchParams } = new URL(request.url);
  const id = params.id; 
  const type = searchParams.get('type') || '';
  try {
    const order = await prisma.order.findUnique({
      where: {
        id: Number(id),
        type: type ? (type as OrderType) : undefined,
      },
      include: {
        user: {
          include: {
            saleUser: true,
          },
        },
        items: {
          include: {
            product: {
              include: { imageProducts: true} ,
            }
          },
        },
      },
    });
    return NextResponse.json(order);
  } catch (error) {
    return NextResponse.json(error);
  } finally {
    await prisma.$disconnect();
  }
}