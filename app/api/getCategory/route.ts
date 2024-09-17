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

async function getCategoryNames(tableName: string, ids: number[]) {
  const model = tableModelMap[tableName];
  if (!model) return [];

  const records = await (prisma as any)[model].findMany({
    where: { id: { in: ids } },
    select: { id: true, name: true },
  });

  return records.map((record: any) => ({
    key: record.id.toString(),
    label: record.name,
  }));
}

export async function GET(req: Request) {
    try {
      // Fetch all minisize entries
      const minisizes = await prisma.minisize.findMany({
        select: {
          id: true,
          lv1: true,
        },
      });
  
      if (!minisizes || minisizes.length === 0) {
        throw new Error("No minisize data found");
      }
  
      let allMenuItems: any[] = [];
  
      // Loop through each minisize entry
      for (const minisize of minisizes) {
        const lv1Array = JSON.parse(minisize.lv1 as string) as any[];
  
        const lv1TableName = lv1Array?.[0]?.data || null;
  
        const lv1Ids = (await prisma.product.findMany({
          distinct: ["lv1Id"],
          select: { lv1Id: true },
          where: { lv1Id: { not: null }, minisizeId: minisize.id },
        }))
          .map((product) => product.lv1Id)
          .filter((id): id is number => id !== null);
  
        const lv1Names = lv1TableName ? await getCategoryNames(lv1TableName, lv1Ids) : [];
  
        // Get only lv1 items without children
        const menuItems = lv1Names.map((lv1: any) => ({
          ...lv1,
          labelTag: `${lv1.label}`,
        }));
  
        // Merge the menuItems for each minisize
        allMenuItems = [...allMenuItems, ...menuItems];
      }
  
      // Remove duplicates based on key and label
      const uniqueMenuItems = allMenuItems.reduce((acc: any[], currentItem) => {
        const x = acc.find(
          (item) => item.key === currentItem.key && item.label === currentItem.label
        );
        if (!x) {
          acc.push(currentItem);
        }
        return acc;
      }, []);
  
      return NextResponse.json(uniqueMenuItems);
    } catch (error) {
      console.error("Error fetching menu items: ", error);
      return NextResponse.json({ error: "Failed to fetch menu items" }, { status: 500 });
    } finally {
      await prisma.$disconnect();
    }
  }
