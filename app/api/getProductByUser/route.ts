import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";

const prisma = new PrismaClient();

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const userId = parseInt(searchParams.get("userId") || "0");
  const page = parseInt(searchParams.get("page") || "1");
  const pageSize = parseInt(searchParams.get("pageSize") || "10");

  if (!userId || isNaN(userId)) {
    return NextResponse.json({ error: "Invalid or missing userId" }, { status: 400 });
  }

  try {
    // Fetch all invoice items for the given userId
    const invoiceItems = await prisma.invoiceItem.findMany({
      where: {
        invoice: {
          userId: userId,
        },
      },
      select: {
        product: {
          select: {
            id: true,
            code: true,
            name: true,
            brand: {
              select: {
                name: true,
              },
            },
            price: true,
            navStock: true,
            portalStock: true,
            image: true,
            createdAt: true,
            updatedAt: true,
          },
        },
        amount: true,
        price: true,
        discount: true,
        discountPrice: true,
      },
      skip: (page - 1) * pageSize,
      take: pageSize,
    });

    // Use Map to ensure unique products by product.id
    const productMap = new Map();
    invoiceItems.forEach((item) => {
      if (!productMap.has(item.product.id)) {
        productMap.set(item.product.id, item);
      }
    });

    // Map unique products to a simplified structure
    const products = Array.from(productMap.values()).map((item: any) => ({
      key: item.product.id,
      label: item.product.code,
      name: item.product.name,
    }));

    const totalCount = await prisma.invoiceItem.count({
      where: {
        invoice: {
          userId: userId,
        },
      },
    });

    return NextResponse.json({
      products,
      totalCount,
      currentPage: page,
      pageSize: pageSize,
    });
  } catch (error) {
    console.error("Error fetching products for invoices: ", error);
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
