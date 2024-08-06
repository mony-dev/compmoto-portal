import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";
const prisma = new PrismaClient();

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q") || "";
  
    try {
      const products = await prisma.promotion.findMany({
        where: {
          OR: [
            { name: { contains: q, mode: "insensitive" } },
            { userGroup: { contains: q, mode: "insensitive" } },
            { productRedeem: { contains: q, mode: "insensitive" } },
          ],
        },
      });
      return NextResponse.json(products);
    } catch (error) {
      return NextResponse.json(error);
    } finally {
      await prisma.$disconnect();
    }
  }
  
  export async function POST( request: Request,
    { body }: {  body: any }) {
    const data = await request.json();
    try {
      const createPromotion = await prisma.promotion.create({
        data: {
          name: data.name,
          isActive: data.isActive,
          amount: data.amount,
          startDate: data.startDate,
          endDate: data.endDate,
          minisizeId: Number(data.minisizeId),
          image: data.image,
          productRedeem: data.productRedeem,
          userGroup: data.userGroup
        }
      })
      return NextResponse.json(createPromotion);
    } catch (error) {
      return NextResponse.json(error);
    } finally {
      await prisma.$disconnect();
    }
  }