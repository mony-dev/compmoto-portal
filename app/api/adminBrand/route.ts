import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";
const prisma = new PrismaClient();

export async function GET(request: Request) {
  try {
    const [brands] = await Promise.all([
      prisma.brand.findMany(),
    ]);
    console.log("Brands:", brands);
    return NextResponse.json({ brands: brands });
  } catch (error) {
    console.log("error:", error);
    return NextResponse.json(error);
  } finally {
    await prisma.$disconnect();
  }
}

