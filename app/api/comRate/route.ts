import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";
const prisma = new PrismaClient();


export async function GET(request: Request) {
  try {
    const [comRate, total] = await Promise.all([
      prisma.comRate.findMany(),
      prisma.comRate.count(),
    ]);
    return NextResponse.json({ data: comRate, total });
  } catch (error) {
    return NextResponse.json(error);
  } finally {
    await prisma.$disconnect();
  }
}
