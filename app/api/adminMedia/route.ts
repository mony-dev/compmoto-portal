import { mediaSchema } from "@lib-schemas/user/media-schema";
import { MediaType, PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";
const prisma = new PrismaClient();
import { z } from "zod";


export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q") || "";
  const typeParam = searchParams.get("type") || "";
  const page = parseInt(searchParams.get("page") || "1");
  const pageSize = parseInt(searchParams.get("pageSize") || "50");
  const isActiveParam = searchParams.get("isActive");

  const minisizeId = searchParams.get("minisizeId");
  // Convert the 'isActive' parameter to a boolean or undefined if not provided
  const isActive = isActiveParam === 'true' ? true : isActiveParam === 'false' ? false : undefined;

  // Function to map string to MediaType enum
  function mapTypeToEnum(type: string): MediaType | undefined {
    switch (type.toLowerCase()) {
      case "video":
        return MediaType.Video;
      case "image":
        return MediaType.Image;
      case "file":
        return MediaType.File;
      default:
        return undefined; // If no matching type, return undefined to exclude from filter
    }
  }

  const type = mapTypeToEnum(typeParam); // Convert string to enum value

  try {
    const whereClause: any = {
      AND: [
        { name: { contains: q, mode: "insensitive" } },
        type ? { type } : {}, // Include type filter if defined
      ],
    };

    // Add isActive condition to the where clause if it is defined
    if (isActive !== undefined) {
      whereClause.AND.push({ isActive });
    }

    if (minisizeId !== undefined) {
      whereClause.AND.push({ minisizeId: Number(minisizeId) });
    }

    const [medias, total] = await Promise.all([
      prisma.media.findMany({
        where: whereClause,
        include: {
          minisize: true,
        },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.media.count({
        where: whereClause,
      }),
    ]);

    return NextResponse.json({ medias, total });
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
    const data = mediaSchema.parse(json); // Validating the input data against the schema
    const url = data.url ?? "";
    // Create new media in the database
    const newMedia = await prisma.media.create({
      data: {
        type: data.type,
        name: data.name,
        isActive: data.isActive,
        minisizeId: data.minisizeId,
        url: url,
        coverImg: data.coverImg,
      },
    });

    return NextResponse.json(newMedia);
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
