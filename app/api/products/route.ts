import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";
const prisma = new PrismaClient();

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const brandIds = searchParams.getAll('brandIds[]').map(Number) || [];
  
    try {
      const products = await prisma.product.findMany({
        where: {
          brandId: { in: brandIds }, 
        },
      });
      return NextResponse.json(products);
    } catch (error) {
      return NextResponse.json(error);
    } finally {
      await prisma.$disconnect();
    }
  }
  