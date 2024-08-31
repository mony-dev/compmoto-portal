import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";
const prisma = new PrismaClient();

export async function GET(request: Request) {
  try {
    const brand = await prisma.brandProduct.findMany({});
    return NextResponse.json(brand);
  } catch (error) {
    console.log("error:", error);
    return NextResponse.json(error);
  } finally {
    await prisma.$disconnect();
  }
}

