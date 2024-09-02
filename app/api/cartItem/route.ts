import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";
const prisma = new PrismaClient();

export async function GET(
    request: Request,
    { params }: { params: { id: number } }
  ) {
    try {
      const { searchParams } = new URL(request.url);
      const userId = searchParams.get("userId") || "";
      const productId = searchParams.get("productId") || "";
      
         // Find the cart associated with the user
         const cart = await prisma.cart.findUnique({
            where: {
              userId: Number(userId),
            },
            include: {
              items: true, // Include cart items to count them
            },
          });
  
      if (!cart) {
        return NextResponse.json({ count: 0 });
      }
      const itemCount = cart.items.find(
        (item: { productId: number }) => item.productId === Number(productId)
    );
      let count = true
      if (itemCount) {
        count = false
      } 
      return NextResponse.json({ count: count });
    } catch (error) {
      return NextResponse.json(error);
    } finally {
      await prisma.$disconnect();
    }
  }