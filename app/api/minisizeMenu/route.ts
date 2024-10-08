import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";
const prisma = new PrismaClient();

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const page = 1;
  const pageSize = 50;

  try {
    const [minisize, total] = await Promise.all([
      prisma.minisize.findMany({
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.minisize.count(),
    ]);
    return NextResponse.json({ data: minisize, total });
  } catch (error) {
    return NextResponse.json(error);
  } finally {
    await prisma.$disconnect();
  }
}
