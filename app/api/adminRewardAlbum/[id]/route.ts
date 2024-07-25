import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";
const prisma = new PrismaClient();

interface dataBodyInterface {
  name: string;
}

export async function GET(
  request: Request,
  { params }: { params: { id: number } }
) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q") || "";
  const id = params.id;
  try {
    const reward = await prisma.rewardAlbum.findUnique({
      where: {
        id: Number(id),
      },
      include: {
        images: true,
      },
    });
    return NextResponse.json(reward);
  } catch (error) {
    return NextResponse.json(error);
  } finally {
    await prisma.$disconnect();
  }
}

export async function PUT(
  request: Request,
  { params, body }: { params: { id: number }; body: any }
) {
  const data = await request.json();
  const id = params.id;

  let dataBody: dataBodyInterface = {
    name: data.name,
  };

  try {
    const updatedAlbum = await prisma.rewardAlbum.update({
      where: {
        id: Number(id),
      },
      data: dataBody,
    });

    // Get current images from the database
    const currentImages = await prisma.image.findMany({
      where: {
        rewardAlbumId: Number(id),
      },
    });

    // Determine which images to delete
    const imagesToDelete = currentImages.filter(ci => 
      !data.image.some((ni: { id: number; }) => ni.id === ci.id)
    );

    // Delete images
    await Promise.all(
      imagesToDelete.map(img =>
        prisma.image.delete({
          where: {
            id: img.id,
          },
        })
      )
    );

    // Handle image array for creation
    const imagesToCreate = data.image.filter((img: { id: number; }) => !img.id).map((img: { url: string; rewardAlbumId: number; }) => ({
      url: img.url,
      rewardAlbumId: img.rewardAlbumId,
    }));

    // Create new images
    const createdImages = await prisma.image.createMany({
      data: imagesToCreate,
      skipDuplicates: true,
    });

    
    return NextResponse.json(updatedAlbum);
  } catch (error) {
    return NextResponse.json(error);
  } finally {
    await prisma.$disconnect();
  }
}

// export async function DELETE(
//   request: Request,
//   { params }: { params: { id: number } }
// ) {
//   const id = params.id;
//   try {
//     const deletedReward = await prisma.reward.delete({
//       where: {
//         id: Number(id),
//       },
//     });
//     return NextResponse.json(deletedReward);
//   } catch (error) {
//     return NextResponse.json(error);
//   } finally {
//     await prisma.$disconnect();
//   }
// }
