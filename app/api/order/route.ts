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
    const user = await prisma.user.findUnique({
      where: {
        id: Number(data.userId),
      }
    });
    const baseUrl = 'https://portal.comp-moto.com/th/admin/';
    const link = data.type === 'normal'
      ? `${baseUrl}normalOrder/${createOrder.id}`
      : `${baseUrl}backOrder/${createOrder.id}`;
    
    const message = `Web Portal : มีออเดอร์สั่งซื้อ จาก ${user?.custNo} \n ${link}`;
    
    const lineToken = process.env.LINE_ACCESS_TOKEN; 
    await sendLineNotification(lineToken, message);

    return NextResponse.json(createOrder);
  } catch (error) {
    return NextResponse.json(error);
  } finally {
    await prisma.$disconnect();
  }
}

async function sendLineNotification(token: any, message: any) {
  const response = await fetch('https://notify-api.line.me/api/notify', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': `Bearer ${token}`,
    },
    body: new URLSearchParams({ message }),
  });

  if (!response.ok) {
    throw new Error('Failed to send LINE notification');
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

  // Define the start and end of the current year
  const startOfYear = new Date(new Date().getFullYear(), 0, 1); // January 1st of this year
  const endOfYear = new Date(new Date().getFullYear(), 11, 31, 23, 59, 59, 999); // December 31st of this year

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
          createdAt: {
            gte: startOfYear,
            lt: endOfYear,
          },
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
          createdAt: {
            gte: startOfYear,
            lt: endOfYear,
          },
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