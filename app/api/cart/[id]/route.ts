import { PrismaClient } from "@prisma/client";
import { getSession } from "next-auth/react";
import { NextResponse } from "next/server";

const prisma = new PrismaClient();

export async function GET(
  request: Request,
  { params }: { params: { id: number } }
) {
  try {
    const userId = params.id;
    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    }
    const cart = await prisma.cart.findUnique({
      where: { userId: Number(userId) },    
      include: {
        items: {
          include: {
            product: {
              include: {
                brand: true,
                imageProducts: true,
                promotion: true
              },
            },
          },
        },
        user: {
          include: {
            minisizes: true
          }
        }
      },
    });
    if (!cart) {
      return NextResponse.json({ error: "Cart not found" }, { status: 404 });
    }
    return NextResponse.json(cart);
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
    const deleted = await prisma.cartItem.delete({
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

export async function PUT(
  request: Request,
  { params }: { params: { id: number } }
) {
  const id = params.id;

  // Read the request body only once
  let body;
  try {
    body = await request.json(); // This reads the request body
  } catch (error) {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  // Destructure `amount`, `price`, and `year` from the parsed body
  const { amount, price, year } = body;

  if (amount === undefined) {
    return NextResponse.json({ error: 'Amount is required' }, { status: 400 });
  }

  try {
    // Construct the data object for the update
    const updateData: any = {
      amount: Number(amount),
      price: Number(price), // Include price if provided
    };

    // Conditionally add `year` to the update data if it's provided
    if (year !== undefined) {
      updateData.year = year;
    }

    const cart = await prisma.cartItem.update({
      where: {
        id: Number(id),
      },
      data: updateData,
    });

    return NextResponse.json(cart);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}