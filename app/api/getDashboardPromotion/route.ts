import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";
const prisma = new PrismaClient();

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const group = searchParams.get('group') || '';
    try {
      const products = await prisma.promotion.findMany({
        where: {
          isActive: true,
          userGroup: group
        },
      });
      return NextResponse.json(products);
    } catch (error) {
      return NextResponse.json(error);
    } finally {
      await prisma.$disconnect();
    }
  }
  
