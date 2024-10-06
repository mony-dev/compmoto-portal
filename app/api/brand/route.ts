import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";
const prisma = new PrismaClient();

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q") || "";
  const page = 1;
  const pageSize = 200;

  try {
    const [brands, total] = await Promise.all([
      prisma.brand.findMany({
        where: {
          OR: [{ name: { contains: q, mode: "insensitive" } }],
        },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.brand.count({
        where: {
          OR: [{ name: { contains: q, mode: "insensitive" } }],
        },
      }),
    ]);
    return NextResponse.json({ brands: brands, total });
  } catch (error) {
    return NextResponse.json(error);
  } finally {
    await prisma.$disconnect();
  }
}
