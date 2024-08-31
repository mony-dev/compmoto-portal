import { PrismaClient } from "@prisma/client";
import { getSession } from "next-auth/react";
import { NextResponse } from "next/server";

const prisma = new PrismaClient();

export async function POST(request: Request) {
  const data = await request.json();
  try {
    const user = await prisma.user.findUnique({
      where: { id: Number(data.userId) },
    });
    if (user) {
      const cart = await prisma.cart.upsert({
        where: { userId: user.id },
        update: {},
        create: {
          userId: user.id,
        },
      });
      const existingCartItem = await prisma.cartItem.findFirst({
        where: {
          cartId: cart.id,
          productId: data.productId,
        },
      });
      let cartItem;
      if (existingCartItem) {
        cartItem = await prisma.cartItem.update({
          where: {
            id: existingCartItem.id,
          },
          data: {
            amount: {
              increment: data.amount,
            },
            type: data.type,
            price: data.price,
            discount: data.discount,
            year: data.year
          },
        });
      } else {
        cartItem = await prisma.cartItem.create({
          data: {
            cartId: cart.id,
            productId: data.productId,
            amount: data.amount,
            type: data.type,
            price: data.price,
            discount: data.discount,
            year: data.year
          },
        });
      }
      return NextResponse.json(cartItem);
    }
  } catch (error) {
    return NextResponse.json(error);
  } finally {
    await prisma.$disconnect();
  }
}
