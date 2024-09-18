import { OrderType, PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";
const prisma = new PrismaClient();

export async function POST(request: Request, { body }: { body: any }) {
  const data = await request.json();
  try {
    const createOrder = await prisma.order.create({
      data: {
        userId: Number(data.userId),
        totalAmount: data.totalAmount,
        totalPrice: data.totalPrice,
        subTotal: data.subTotal,
        groupDiscount: data.groupDiscount,
        type: data.type,
        externalDocument: data.externalDocument,
        documentNo: 'test'
      },
    });
    return NextResponse.json(createOrder);
  } catch (error) {
    return NextResponse.json(error);
  } finally {
    await prisma.$disconnect();
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q') || '';
  const type = searchParams.get('type') || '';
  const userId = searchParams.get('userId') || '';
  const page = parseInt(searchParams.get("page") || "1");
  const pageSize = parseInt(searchParams.get("pageSize") || "30");
  if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 });
  }

  try {
    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where: {
          userId: Number(userId),
          type: type ? (type as OrderType) : undefined,
          OR: q ? [
            {
              documentNo: {
                contains: q, 
                mode: 'insensitive', 
              },
            }
          ] : undefined,
        },
        include: {
          user: true,
          items: {
            include: {
              product: true,
            },
          },
        },
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: {
          createdAt: 'desc',
        },
      }),
      prisma.order.count({
        where: {
          userId: Number(userId),
          type: type ? (type as OrderType) : undefined,
          OR: q ? [
            {
              documentNo: {
                contains: q, 
                mode: 'insensitive', 
              },
            }
          ] : undefined,
        },
      }),
    ]);
    return NextResponse.json({ orders: orders, total });
  } catch (error) {
    return NextResponse.json(error);
  } finally {
    await prisma.$disconnect();
  }
}