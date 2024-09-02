import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";
const prisma = new PrismaClient();
interface CartItem {
    cartId: number;
    orderId: number;
    unitPrice: number;
    productId: number;
    code: string;
    amount: number;
    type: string;
    price: number;
    year: number;
    discount: number;
    discountPrice: number;
  }
export async function POST(request: Request, { body }: { body: any }) {
  const data = await request.json();
  try {
    const itemsWithoutCartId = data.items.map(({ cartId, code, unitPrice, ...rest }: CartItem) => rest);
    const orderItems = await prisma.orderItem.createMany({
        data: itemsWithoutCartId,
      });
  
   // Delete cart items
   await Promise.all(
    data.items.map((item: any) =>
      prisma.cartItem.delete({
        where: {
          id: item.cartId,
        },
      })
    )
  );
  
    return NextResponse.json(orderItems);
  } catch (error) {
    return NextResponse.json(error);
  } finally {
    await prisma.$disconnect();
  }
}
