import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";
const prisma = new PrismaClient();

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q") || "";
    const page = parseInt(searchParams.get("page") || "1");
    const pageSize = parseInt(searchParams.get("pageSize") || "1000");
    try {
      const [promotions, total] = await Promise.all([
        prisma.promotion.findMany({
          where: {
            OR: [
              { name: { contains: q, mode: "insensitive" } },
              { userGroup: { contains: q, mode: "insensitive" } },
              { productRedeem: { contains: q, mode: "insensitive" } },
            ],
          },
          skip: (page - 1) * pageSize,
          take: pageSize,
        }),
        prisma.promotion.count({
          where: {
            OR: [
              { name: { contains: q, mode: "insensitive" } },
              { userGroup: { contains: q, mode: "insensitive" } },
              { productRedeem: { contains: q, mode: "insensitive" } },
            ],
          },
        }),
      ]);
      return NextResponse.json({ promotions: promotions, total });
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