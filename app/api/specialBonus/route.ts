// api/specialBonus.ts

import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";

const prisma = new PrismaClient();

export async function GET(request: Request) {
  const page = 1;
  const pageSize = 50;

  try {
    const [specialBonus] = await Promise.all([
      prisma.specialBonus.findFirst({
        where: {
          isActive: true,
        },
        include: {
          items: {
            orderBy: {
              order: "asc",
            },
            include: {
              brand: {
                include: {
                  minisizes: true, // Include minisizes related to the brand
                },
              },
            }
          },
        },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
    ]);
    return NextResponse.json({ data: specialBonus, total: 1 });
  } catch (error) {
    return NextResponse.json(error);
  } finally {
    await prisma.$disconnect();
  }
}
