import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";
const prisma = new PrismaClient();

interface dataBodyInterface {
  image?: string;
}

export async function PUT( request: Request,
  { params, body }: { params: { id: number }; body: any }) {
  const data = await request.json();
  const id = params.id;

  let dataBody: dataBodyInterface = {
    image: data.image,
  }
  
  try {
    const updatedUser = await prisma.user.update({
      where: {
        id: Number(id),
      },
      data: dataBody,
    });
    return NextResponse.json(updatedUser);
  } catch (error) {
    return NextResponse.json(error);
  } finally {
    await prisma.$disconnect();
  }
}


export async function GET(
  request: Request,
  { params }: { params: { id: number } }
) {
  const id = params.id; 
  console.log("update", id)
  try {
    const user = await prisma.user.findUnique({
      where: {
        id: Number(id),
      },
    });
    return NextResponse.json(user);
  } catch (error) {
    return NextResponse.json(error);
  } finally {
    await prisma.$disconnect();
  }
}
