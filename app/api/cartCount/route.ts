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
  
      const itemCount = cart.items.length;
  
      return NextResponse.json({ count: itemCount });
    } catch (error) {
      return NextResponse.json(error);
    } finally {
      await prisma.$disconnect();
    }
  }