import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";
const prisma = new PrismaClient();

export async function PUT( request: Request,
  { params, body }: { params: { id: number }; body: any }) {
  const data = await request.json();
  const id = params.id;
  
  interface dataBodyInterface {
    brandId: number,
    name: string,
    isActive: boolean,
    lv1: string,
    lv2: string,
    lv3: string,
  }

  let dataBody: dataBodyInterface = {
    brandId: data.brandId,
    name: data.name,
    isActive: data.isActive,
    lv1: JSON.stringify(data.lv1),
    lv2: JSON.stringify(data.lv2),
    lv3: JSON.stringify(data.lv3),
  }
  
  try {
    const updatedMinisize = await prisma.minisize.update({
      where: {
        id: Number(id),
      },
      data: dataBody,
    });
    return NextResponse.json(updatedMinisize);
  } catch (error) {
    return NextResponse.json(error);
  } finally {
    await prisma.$disconnect();
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: number } }
) {
  const id = params.id;
  try {
    const deleted = await prisma.minisize.delete({
      where: {
        id: Number(id),
      },
    });
    return NextResponse.json(deleted);
  } catch (error) {
    return NextResponse.json(error);
  } finally {
    await prisma.$disconnect();
  }
}
