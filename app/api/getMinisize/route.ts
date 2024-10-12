import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";
const prisma = new PrismaClient();

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q") || "";
  const page = 1;
  const pageSize = 200;

  try {
    const [minisizes, total] = await Promise.all([
      prisma.minisize.findMany({
        where: { isActive: true },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.minisize.count({
        where: { isActive: true }
      }),
    ]);
    return NextResponse.json({ minisizes: minisizes, total });
  } catch (error) {
    return NextResponse.json(error);
  } finally {
    await prisma.$disconnect();
  }
}
