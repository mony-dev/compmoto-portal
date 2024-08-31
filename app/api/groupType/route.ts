import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";
const prisma = new PrismaClient();

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const page = 1;
  const pageSize = 50;

  try {
    const [groupType, total] = await Promise.all([
      prisma.groupType.findMany({
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.groupType.count(),
    ]);
    return NextResponse.json({ data: groupType, total });
  } catch (error) {
    return NextResponse.json(error);
  } finally {
    await prisma.$disconnect();
  }
}
