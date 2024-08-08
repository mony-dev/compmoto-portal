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
  const url = new URL(req.url);
  const minisizeId = url.searchParams.get("minisizeId");
  if (!minisizeId) {
    return NextResponse.json({ error: "Missing minisizeId parameter" }, { status: 400 });
  }

  try {
    const minisize = await prisma.minisize.findUnique({
      where: { id: parseInt(minisizeId) },
      select: {
        lv1: true,
        lv2: true,
        lv3: true,
      },
    });

    if (!minisize) {
      throw new Error("No minisize data found");
    }

    const lv1Array = JSON.parse(minisize.lv1 as string) as any[];
    const lv2Array = JSON.parse(minisize.lv2 as string) as any[];
    const lv3Array = JSON.parse(minisize.lv3 as string) as any[];

    const lv1TableName = lv1Array?.[0]?.data || null;
    const lv2TableName = lv2Array?.[0]?.data || null;
    const lv3TableName = lv3Array?.[0]?.data || null;

    const lv1Ids = (await prisma.product.findMany({
      distinct: ["lv1Id"],
      select: { lv1Id: true },
      where: { lv1Id: { not: null }, minisizeId: parseInt(minisizeId) },
    }))
      .map((product) => product.lv1Id)
      .filter((id): id is number => id !== null);

    const lv2Ids = (await prisma.product.findMany({
      distinct: ["lv2Id"],
      select: { lv2Id: true },
      where: { lv2Id: { not: null }, minisizeId: parseInt(minisizeId) },
    }))
      .map((product) => product.lv2Id)
      .filter((id): id is number => id !== null);

    const lv3Ids = (await prisma.product.findMany({
      distinct: ["lv3Id"],
      select: { lv3Id: true },
      where: { lv3Id: { not: null }, minisizeId: parseInt(minisizeId) },
    }))
      .map((product) => product.lv3Id)
      .filter((id): id is number => id !== null);

    const lv1Names = lv1TableName ? await getCategoryNames(lv1TableName, lv1Ids) : [];
    const lv2Names = lv2TableName ? await getCategoryNames(lv2TableName, lv2Ids) : [];
    const lv3Names = lv3TableName ? await getCategoryNames(lv3TableName, lv3Ids) : [];

    const menuItems = lv1Names.map((lv1: any) => ({
      ...lv1,
      children: lv2Names.map((lv2: any) => ({
        ...lv2,
        key: `${lv1.key}-${lv2.key}`,
        children: lv3Names.map((lv3: any) => ({
          ...lv3,
          key: `${lv1.key}-${lv2.key}-${lv3.key}`,
        })),
      })),
    }));

    return NextResponse.json(menuItems);
  } catch (error) {
    console.error("Error fetching menu items: ", error);
    return NextResponse.json({ error: "Failed to fetch menu items" }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
