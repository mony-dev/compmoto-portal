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

  // Convert the 'isActive' parameter to a boolean or undefined if not provided

  try {
    const whereClause: any = {
      AND: [
        { name: { contains: q, mode: "insensitive" } },
      ],
    };

    const [userManuals, total] = await Promise.all([
      prisma.userManual.findMany({
        where: whereClause,
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.userManual.count(),
    ]);
    return NextResponse.json({ userManuals, total });
  } catch (error) {
    console.error("Error fetching data:", error);
    return NextResponse.json(error);
  } finally {
    await prisma.$disconnect();
  }
}

export async function POST(request: Request) {
  try {
    // Parse and validate the request body using zod
    const json = await request.json();
    const data = manualSchema.parse(json); // Validating the input data against the schema
    // Create new media in the database
    const newManual = await prisma.userManual.create({
      data: {
        name: data.name,
        content: data.content,
      },
    });

    return NextResponse.json(newManual);
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      // If there is a validation error, return a 400 status with the error message
      return NextResponse.json(
        { error: "Validation failed", details: error.errors },
        { status: 400 }
      );
    } else {
      // Handle other types of errors (like Prisma errors)
      return NextResponse.json(
        { error: "Internal Server Error", message: error.message },
        { status: 500 }
      );
    }
  } finally {
    await prisma.$disconnect();
  }
}
