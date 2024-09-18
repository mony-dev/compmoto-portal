import { OrderType, PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";
const prisma = new PrismaClient();

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q') || '';
  const userId = searchParams.get('userId') || '';
  const userRole = searchParams.get('role') || '';
  const page = parseInt(searchParams.get("page") || "1");
  const pageSize = parseInt(searchParams.get("pageSize") || "1000");
  if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 });
  }

  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const endOfMonth = new Date(startOfMonth);
  endOfMonth.setMonth(startOfMonth.getMonth() + 1);

  try {
    const [orders, total] = await Promise.all([
      prisma.invoice.findMany({
        where: {
          OR: q ? [
            {
              documentNo: {
                contains: q, 
                mode: 'insensitive', 
              },
            }
          ] : undefined,
          createdAt: {
            gte: startOfMonth,
            lt: endOfMonth,
          },
          ...(userRole === 'SALE' && {
            user: {
              saleUserId: parseInt(userId),
            }
          }),
        },
        include: {
          user: {
              include: {
                saleUser: true,
              },
          },
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
      prisma.invoice.count({
        where: {
          OR: q ? [
            {
              documentNo: {
                contains: q, 
                mode: 'insensitive', 
              },
            }
          ] : undefined,
          createdAt: {
            gte: startOfMonth,
            lt: endOfMonth,
          },
          ...(userRole === 'SALE' && {
            user: {
              saleUserId: parseInt(userId),
            }
          }),
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