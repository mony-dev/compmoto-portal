import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";
const prisma = new PrismaClient();


export async function GET(request: Request) {
  try {
    const [family, total] = await Promise.all([
      prisma.family.findMany(),
      prisma.family.count(),
    ]);
    return NextResponse.json({ data: family, total });
  } catch (error) {
    return NextResponse.json(error);
  } finally {
    await prisma.$disconnect();
  }
}
