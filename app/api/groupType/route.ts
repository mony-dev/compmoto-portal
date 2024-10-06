import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";
const prisma = new PrismaClient();

export async function GET(request: Request) {
  try {
    const [groupType, total] = await Promise.all([
      prisma.groupType.findMany(),
      prisma.groupType.count(),
    ]);
    return NextResponse.json({ data: groupType, total });
  } catch (error) {
    return NextResponse.json(error);
  } finally {
    await prisma.$disconnect();
  }
}
