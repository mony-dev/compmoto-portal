import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";
const prisma = new PrismaClient();
import { z } from "zod";

export async function PUT( request: Request,
  { params, body }: { params: { id: number }; body: any }) {
  const data = await request.json();
  const id = params.id;
  try {
    const updatedManual = await prisma.userManual.update({
      where: {
        id: Number(id),
      },
      data: data,
    });

    return NextResponse.json(updatedManual);
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

export async function DELETE(
  request: Request,
  { params }: { params: { id: number } }
) {
  const id = params.id;
  try {
    const deleted = await prisma.userManual.delete({
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

export async function GET(
  request: Request,
  { params }: { params: { id: number } }
) {
  const id = params.id; 
  console.log("sdfsdfsdfsdf")
  try {
    const manual = await prisma.userManual.findUnique({
      where: {
        id: Number(id),
      }
    });
    console.log("manual", manual)
    return NextResponse.json(manual);
  } catch (error) {
    console.log(error)
    return NextResponse.json(error);
  } finally {
    await prisma.$disconnect();
  }
}