import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";
const prisma = new PrismaClient();

export async function GET() {
  try {
    const album = await prisma.rewardAlbum.findMany({
      include: {
        images: true
      },
    });
    return NextResponse.json(album);
  } catch (error) {
    return NextResponse.json(error);
  } finally {
    await prisma.$disconnect();
  }
}

export async function POST(
  request: Request,
  { body }: { body: any }
) {
  const data = await request.json();

  try {
    const newAlbum = await prisma.rewardAlbum.create({
      data: {
        name: data.name,
      },
    });

    const imagesToCreate = data.image.map((img: { url: string; }) => ({
      url: img.url,
      rewardAlbumId: newAlbum.id,
    }));

    const createdImages = await prisma.image.createMany({
      data: imagesToCreate,
      skipDuplicates: true, 
    });

    return NextResponse.json({ newAlbum, createdImages });
  } catch (error) {
    console.log("error", error)

    return NextResponse.json(error);
  } finally {
    await prisma.$disconnect();
  }
}
