import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";
const prisma = new PrismaClient();

export async function GET() {
  try {
    const brands = await prisma.brand.findMany();
    return NextResponse.json(brands);
  } catch (error) {
    console.log("error", error);
    return NextResponse.json(error);
  } finally {
    await prisma.$disconnect(); // Optionally disconnect
  }
}
