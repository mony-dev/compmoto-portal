import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";

const prisma = new PrismaClient();
const tableModelMap: Record<string, keyof PrismaClient> = {
  ProductGroup: "productGroup",
  Size: "size",
  Rim: "rim",
  Brand: "brand",
  GroupType: "groupType",
  ComRate: "comRate",
  Family: "family",
};

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
            lv1Id: true,
            lv2Id: true,
            lv3Id: true,
            brand: {
              select: {
                name: true,
              },
            },
            minisize: {
              select: {
                name: true,
                lv1: true,
                lv2: true,
                lv3: true,
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

    // Properly handle asynchronous map with Promise.all
    const productDetails = await Promise.all(
      invoiceItems.map(async (item: any) => {
        const { product } = item;
        const minisize = product?.minisize;

        if (!minisize) {
          return {
            ...product,
            lv1Name: null,
            lv2Name: null,
            lv3Name: null,
          };
        }

        const lv1Array = minisize.lv1 ? JSON.parse(minisize.lv1 as string) : [];
        const lv2Array = minisize.lv2 ? JSON.parse(minisize.lv2 as string) : [];
        const lv3Array = minisize.lv3 ? JSON.parse(minisize.lv3 as string) : [];
        const lv1Data = lv1Array.length > 0 ? lv1Array[0] : null;
        const lv2Data = lv2Array.length > 0 ? lv2Array[0] : null;
        const lv3Data = lv3Array.length > 0 ? lv3Array[0] : null;
        const lv1Name = lv1Data?.data && product.lv1Id ? await getCategoryName(lv1Data.data, product.lv1Id) : null;
        const lv2Name = lv2Data?.data && product.lv2Id ? await getCategoryName(lv2Data.data, product.lv2Id) : null;
        const lv3Name = lv3Data?.data && product.lv3Id ? await getCategoryName(lv3Data.data, product.lv3Id) : null;

        return {
          ...product,
          lv1Name: lv1Name?.name || null,
          lv2Name: lv2Name?.name || null,
          lv3Name: lv3Name?.name || null,
        };
      })
    );

    return NextResponse.json({
      products,
      productDetails,
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

async function getCategoryName(tableName: string, id: number) {
  const model = tableModelMap[tableName];
  if (!model) return null;
  return (prisma as any)[model].findUnique({
    where: { id },
    select: { name: true },
  });
}
