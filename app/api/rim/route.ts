import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";
const prisma = new PrismaClient();

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const page = 1;
  const pageSize = 50;

  try {
    const [rim, total] = await Promise.all([
      prisma.rim.findMany({
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.rim.count(),
    ]);
    return NextResponse.json({ data: rim, total });
  } catch (error) {
    return NextResponse.json(error);
  } finally {
    await prisma.$disconnect();
  }
}
