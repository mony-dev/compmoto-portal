import { NextResponse } from "next/server";
import { OrderType, PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

interface dataBodyInterface {
    documentNo: string;
}


export async function GET(
  request: Request,
  { params }: { params: { id: number } }
) {
  const { searchParams } = new URL(request.url);
  const id = params.id; 
  try {
    const order = await prisma.invoice.findUnique({
      where: {
        id: Number(id),
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