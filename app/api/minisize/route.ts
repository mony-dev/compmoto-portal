import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";
const prisma = new PrismaClient();

export async function GET(request: Request) {
  try {
    const minisizeItems = await prisma.minisize.findMany({
      where: { isActive: true },
      select: {
        name: true,
      },
    });
    return NextResponse.json(minisizeItems);
  } catch (error) {
    return NextResponse.json(error);
  } finally {
    await prisma.$disconnect();
  }
}
