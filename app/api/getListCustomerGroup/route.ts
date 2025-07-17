import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";
const prisma = new PrismaClient();

export async function GET(request: Request) {
  try {
    const [customerGroups, total] = await Promise.all([
      prisma.customerGroup.findMany(),
      prisma.customerGroup.count(),
    ]);
    return NextResponse.json({ customerGroups: customerGroups, total });
  } catch (error) {
    return NextResponse.json(error);
  } finally {
    await prisma.$disconnect();
  }
}
