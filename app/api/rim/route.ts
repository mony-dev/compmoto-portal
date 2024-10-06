import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";
const prisma = new PrismaClient();

export async function GET(request: Request) {
  try {
    const [rim, total] = await Promise.all([
      prisma.rim.findMany(),
      prisma.rim.count(),
    ]);
    return NextResponse.json({ data: rim, total });
  } catch (error) {
    return NextResponse.json(error);
  } finally {
    await prisma.$disconnect();
  }
}
