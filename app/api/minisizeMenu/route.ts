import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";
const prisma = new PrismaClient();

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  const userIdParam = searchParams.get("userId");
  const page = Number(searchParams.get("page") ?? "1");
  const pageSize = Number(searchParams.get("pageSize") ?? "50");

  if (!userIdParam || Number.isNaN(Number(userIdParam))) {
    return NextResponse.json({ error: "userId is required" }, { status: 400 });
  }
  const userId = Number(userIdParam);

  const where = {
    isActive: true,
    users: { some: { id: userId } },
  } as const;

  try {
    const [minisizes, total] = await Promise.all([
      prisma.minisize.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { id: "asc" }, 
      }),
      prisma.minisize.count({ where }),
    ]);

    return NextResponse.json({
      data: minisizes,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}