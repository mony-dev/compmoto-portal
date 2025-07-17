import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";
const prisma = new PrismaClient();

export async function GET(
    request: Request,
    { params }: { params: { id: number } }
  ) {
    const id = Number(params.id);
  
    try {
      const record = await prisma.specialBonus.findFirst({
        where: {
          customerGroupId: id,
          isActive: true,
        },
      });
  
      const found = !!record; // convert to boolean
      return NextResponse.json({ found: found, id: record?.id });
    } catch (error) {
      console.error("Error fetching special bonus:", error);
      return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    } finally {
      await prisma.$disconnect();
    }
  }