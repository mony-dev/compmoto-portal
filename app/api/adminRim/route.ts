import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";
const prisma = new PrismaClient();

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q") || "";

  const page = parseInt(searchParams.get("page") || "1");
  const pageSize = parseInt(searchParams.get("pageSize") || "50");

  try {
    const [rims, total] = await Promise.all([
      prisma.rim.findMany({
        where: {
          OR: [
            { name: { contains: q, mode: "insensitive" } },
          ],
        },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.rim.count(
        {
          where: {
            OR: [
              { name: { contains: q, mode: "insensitive" } },
            ],
          },
        }
      ),
    ]);
    return NextResponse.json({ data: rims, total });
  } catch (error) {
    return NextResponse.json(error);
  } finally {
    await prisma.$disconnect();
  }
}