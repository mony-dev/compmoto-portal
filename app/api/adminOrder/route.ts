import { OrderType, PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";
const prisma = new PrismaClient();

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q') || '';
  const type = searchParams.get('type') || '';
  const userId = searchParams.get('userId') || '';
  const userRole = searchParams.get('role') || '';
  const page = parseInt(searchParams.get("page") || "1");
  const pageSize = parseInt(searchParams.get("pageSize") || "1000");
  if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 });
  }

  const startOfYear = new Date(new Date().getFullYear(), 0, 1); 
  const endOfYear = new Date(new Date().getFullYear(), 11, 31, 23, 59, 59, 999);

  try {
    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where: {
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
      prisma.order.count({
        where: {
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