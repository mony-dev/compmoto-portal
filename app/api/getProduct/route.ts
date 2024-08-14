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
    Family: "family"
  };

  
  export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q") || "";
    const sortBy = searchParams.get("sortBy") || "";
    const brandName = searchParams.get('brandName')?.toUpperCase() || '';
    const lv1 = searchParams.get('lv1') || null;
    const lv2 = searchParams.get('lv2') || null;
    const lv3 = searchParams.get('lv3') || null;

    try {
      const products = await prisma.product.findMany({
        where: {
          AND: [
            {
              OR: [
                { name: { contains: q, mode: "insensitive" } },
                { code: { contains: q, mode: "insensitive" } },
              ],
            },
            brandName ? {
              brand: {
                name: { contains: brandName, mode: "insensitive" }
              }
            } : {},
            lv1 ? { lv1Id: parseInt(lv1) } : {},
            lv2 ? { lv2Id: parseInt(lv2) } : {},
            lv3 ? { lv3Id: parseInt(lv3) } : {},
          ],
        },
        include: {
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
          promotion: {
            select: {
              name: true,
            },
          },
          imageProducts: true,
        },
      });

      const detailedProducts = await Promise.all(
        products.map(async (product) => {
          if (!product.minisize) {
            return {
              ...product,
              lv1Name: null,
              lv2Name: null,
              lv3Name: null,
            };
          }
  
          const lv1Array = product.minisize.lv1 ? JSON.parse(product.minisize.lv1 as string) : [];
          const lv2Array = product.minisize.lv2 ? JSON.parse(product.minisize.lv2 as string) : [];
          const lv3Array = product.minisize.lv3 ? JSON.parse(product.minisize.lv3 as string) : [];
  
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
      return NextResponse.json(detailedProducts);
    } catch (error) {
      console.error("Error fetching data: ", error);
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
  