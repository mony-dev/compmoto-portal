import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";
const prisma = new PrismaClient();

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q") || "";
    const page = parseInt(searchParams.get("page") || "1");
    const pageSize = parseInt(searchParams.get("pageSize") || "50");
  
    try {
      const whereClause: any = {
        AND: [
          { name: { contains: q, mode: "insensitive" }, isActive: true },
        ],
      };

      const [news, total] = await Promise.all([
        prisma.news.findMany({
          where: whereClause,
          skip: (page - 1) * pageSize,
          take: pageSize,
        }),
        prisma.news.count({
          where: whereClause, 
        }),
      ]);
  
      return NextResponse.json({ news, total });
    } catch (error) {
      console.error("Error fetching data:", error);
      return NextResponse.json(error);
    } finally {
      await prisma.$disconnect();
    }
  }
  