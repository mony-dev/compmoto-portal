import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";
const prisma = new PrismaClient();

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const brandId = searchParams.get('brandId') || '';
  
    try {
      const products = await prisma.product.findMany({
        where: {
            brandId: { equals: Number(brandId) }
        }
     
      });
      return NextResponse.json(products);
    } catch (error) {
      return NextResponse.json(error);
    } finally {
      await prisma.$disconnect();
    }
  }
  