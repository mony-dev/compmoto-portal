import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";
const prisma = new PrismaClient();
const page = 1;
const pageSize = 200;
export async function GET(request: Request) {
  try {
    const [rim, total] = await Promise.all([
      prisma.rim.findMany(
        {
          skip: (page - 1) * pageSize,
          take: pageSize,
        }
      ),
      prisma.rim.count(),
    ]);
    return NextResponse.json({ data: rim, total });
  } catch (error) {
    return NextResponse.json(error);
  } finally {
    await prisma.$disconnect();
  }
}
