import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";
const prisma = new PrismaClient();

// export async function GET(request: Request) {
//   try {
//     const brand = await prisma.brandProduct.findMany();
//     return NextResponse.json(brand);
//   } catch (error) {
//     console.log("error:", error);
//     return NextResponse.json(error);
//   } finally {
//     await prisma.$disconnect();
//   }
// }

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const page = 1;
  const pageSize = 50;

  try {
    const [brands, total] = await Promise.all([
      prisma.brandProduct.findMany({
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.brandProduct.count(),
    ]);
    return NextResponse.json({ brands: brands, total });
  } catch (error) {
    return NextResponse.json(error);
  } finally {
    await prisma.$disconnect();
  }
}
