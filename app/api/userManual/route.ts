import { manualSchema } from "@lib-schemas/user/user-manual-schema";
import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";
const prisma = new PrismaClient();
import { z } from "zod";


export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q") || "";
    const page = parseInt(searchParams.get("page") || "1");
    const pageSize = parseInt(searchParams.get("pageSize") || "50");
  
    try {
      const whereClause: any = {
        AND: [
          { name: { contains: q, mode: "insensitive" } },
        ],
      };
  
      // Apply the same whereClause to both queries
      const [userManuals, total] = await Promise.all([
        prisma.userManual.findMany({
          where: whereClause,
          skip: (page - 1) * pageSize,
          take: pageSize,
        }),
        prisma.userManual.count({
          where: whereClause, // Apply the same filter to count the total results
        }),
      ]);
  
      console.log(userManuals);
      return NextResponse.json({ userManuals, total });
    } catch (error) {
      console.error("Error fetching data:", error);
      return NextResponse.json(error);
    } finally {
      await prisma.$disconnect();
    }
  }
  