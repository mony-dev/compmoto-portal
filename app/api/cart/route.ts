import { PrismaClient } from "@prisma/client";
import { getSession } from "next-auth/react";
import { NextResponse } from "next/server";

const prisma = new PrismaClient();

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

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
                // Note: 'years' is a JSON field, not a relation. So no need to include it like this.
              },
            },
          },
        },
      },
    });
    if (!cart) {
      return NextResponse.json({ error: "Cart not found" }, { status: 404 });
    }

    // const cartData = {
    //   key: cart.id,
    //   id: cart.id,
    //   userId: cart.userId,
    //   items: cart.items.map((item) => ({
    //     type: item.type,
    //     price: item.price,
    //     discount: item.discount,
    //     amount: item.amount,
    //     product: {
    //       name: item.product.name,
    //       brandName: item.product.brand.name,
    //       price: item.product.price,
    //       years: item.product.years,
    //       imageProduct: item.product.imageProducts.map((image) => ({
    //         id: image.id,
    //         url: image.url,
    //       })),
    //     },
    //   })),
    // };

    return NextResponse.json(cart);
  } catch (error) {
    return NextResponse.json(error);
  } finally {
    await prisma.$disconnect();
  }
}

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
