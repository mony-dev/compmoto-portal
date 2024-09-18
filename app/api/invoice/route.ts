import { OrderType, PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";
const prisma = new PrismaClient();

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q') || '';
  const userId = searchParams.get('userId') || '';
  const page = parseInt(searchParams.get("page") || "1");
  const pageSize = parseInt(searchParams.get("pageSize") || "30");
  if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 });
  }

  try {
    const [orders, total] = await Promise.all([
      prisma.invoice.findMany({
        where: {
          userId: Number(userId),
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
      prisma.invoice.count({
        where: {
          userId: Number(userId),
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