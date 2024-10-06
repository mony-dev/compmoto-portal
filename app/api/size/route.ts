import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";
const prisma = new PrismaClient();


export async function GET(request: Request) {
  try {
    const [size, total] = await Promise.all([
      prisma.size.findMany(),
      prisma.size.count(),
    ]);
    return NextResponse.json({ data: size, total });
  } catch (error) {
    return NextResponse.json(error);
  } finally {
    await prisma.$disconnect();
  }
}
