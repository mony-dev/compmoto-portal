import { PrismaClient } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";

/**
 * ✅ Prisma singleton (Next.js best practice)
 */
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };
const prisma = globalForPrisma.prisma ?? new PrismaClient();
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

const JWT_SECRET = process.env.JWT_SECRET || "nav-secret-key";

function verifyToken(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) return null;
  const token = authHeader.split(" ")[1];
  try {
    return jwt.verify(token, JWT_SECRET) as any;
  } catch {
    return null;
  }
}

type NavProductPayload = {
  code: string;
  name?: string;

  brandName?: string;

  Size?: string;
  ComRate?: string;
  Rim?: string;
  Family?: string;
  GroupType?: string;
  ProductGroup?: string;

  price?: number;
  inventory?: number;
  showInPortal?: boolean;

  itemImage?: string;
};

function toHttpsUrl(raw?: string) {
  const v = String(raw || "").trim();
  if (!v) return "";
  if (v.startsWith("http://") || v.startsWith("https://")) return v;
  return `https://${v}`;
}

function cleanName(v?: string) {
  const s = String(v || "").trim();
  return s || null;
}

/**
 * helper: upsert master by name -> id
 */
async function upsertByName(
  model:
    | "brand"
    | "comRate"
    | "family"
    | "groupType"
    | "productGroup"
    | "rim"
    | "size",
  name: string | null,
): Promise<number | null> {
  if (!name) return null;

  switch (model) {
    case "brand": {
      const r = await prisma.brand.upsert({
        where: { name },
        create: { name },
        update: {},
        select: { id: true },
      });
      return r.id;
    }
    case "comRate": {
      const r = await prisma.comRate.upsert({
        where: { name },
        create: { name },
        update: {},
        select: { id: true },
      });
      return r.id;
    }
    case "family": {
      const r = await prisma.family.upsert({
        where: { name },
        create: { name },
        update: {},
        select: { id: true },
      });
      return r.id;
    }
    case "groupType": {
      const r = await prisma.groupType.upsert({
        where: { name },
        create: { name },
        update: {},
        select: { id: true },
      });
      return r.id;
    }
    case "productGroup": {
      const r = await prisma.productGroup.upsert({
        where: { name },
        create: { name },
        update: {},
        select: { id: true },
      });
      return r.id;
    }
    case "rim": {
      const r = await prisma.rim.upsert({
        where: { name },
        create: { name },
        update: {},
        select: { id: true },
      });
      return r.id;
    }
    case "size": {
      const r = await prisma.size.upsert({
        where: { name },
        create: { name },
        update: {},
        select: { id: true },
      });
      return r.id;
    }
  }
}

export async function POST(request: NextRequest) {
  const tokenPayload = verifyToken(request);
  if (!tokenPayload) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = (await request.json()) as NavProductPayload;

    const code = String(body.code || "").trim();
    if (!code) {
      return NextResponse.json({ message: "code is required" }, { status: 400 });
    }

    const name = String(body.name || "").trim();
    const price = Number(body.price ?? 0);
    const inventory = Number(body.inventory ?? 0);
    const showInPortal = Boolean(body.showInPortal);
    const image = toHttpsUrl(body.itemImage);

    // ---- 1) upsert masters (เหมือนสคริปต์เดิม แต่เป็นรายตัวจาก payload) ----
    const brandId = await upsertByName("brand", cleanName(body.brandName));
    const sizeId = await upsertByName("size", cleanName(body.Size));
    const comRateId = await upsertByName("comRate", cleanName(body.ComRate));
    const rimId = await upsertByName("rim", cleanName(body.Rim));
    const familyId = await upsertByName("family", cleanName(body.Family));
    const groupTypeId = await upsertByName("groupType", cleanName(body.GroupType));
    const productGroupId = await upsertByName("productGroup", cleanName(body.ProductGroup));

    if (!brandId) {
      return NextResponse.json({ message: "brandName is required" }, { status: 400 });
    }

    if (!showInPortal) {
      return NextResponse.json({ message: "showInPortal must be true" }, { status: 400 });
    }
    // ---- 2) ถ้า showInPortal = false → ลบเหมือน logic เดิม ----
    // if (!showInPortal) {
    //   const existing = await prisma.product.findUnique({
    //     where: { code },
    //     select: { code: true },
    //   });

    //   if (existing) {
    //     await prisma.product.delete({ where: { code } });
    //   }

    //   return NextResponse.json(
    //     { message: "success", action: existing ? "deleted" : "noop", code },
    //     { status: 200 },
    //   );
    // }

    // ---- 3) upsert product ----
    // years default เหมือนเดิม (ถ้าคุณยังใช้ field years เป็น string)
    const yearsDefault = [
      { year: "2019", discount: 0, isActive: false, isDisable: true },
      { year: "2020", discount: 0, isActive: false, isDisable: true },
      { year: "2021", discount: 0, isActive: false, isDisable: true },
      { year: "2022", discount: 0, isActive: false, isDisable: true },
      { year: "2023", discount: 0, isActive: false, isDisable: true },
      { year: "2024", discount: 0, isActive: false, isDisable: true },
    ];

    const product = await prisma.product.upsert({
      where: { code },
      create: {
        code,
        name,
        brandId,
        price,
        navStock: inventory,
        portalStock: inventory,
        years: JSON.stringify(yearsDefault),
        image,
      },
      update: {
        name,
        brandId,
        price,
        navStock: inventory,
        portalStock: inventory,
        image,
      },
      select: {
        id: true,
        code: true,
        name: true,
        price: true,
        navStock: true,
        portalStock: true,
        image: true,
        brandId: true
      },
    });

    return NextResponse.json(
      { message: "success", action: "upserted", product },
      { status: 200 },
    );
  } catch (error: any) {
    return NextResponse.json(
      { message: "Internal Server Error", error: error?.message ?? String(error) },
      { status: 500 },
    );
  }
}

export async function PATCH(request: NextRequest) {
  const tokenPayload = verifyToken(request);
  if (!tokenPayload) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = (await request.json()) as NavProductPayload;

    const code = String(body.code || "").trim();
    if (!code) {
      return NextResponse.json({ message: "code is required" }, { status: 400 });
    }

    const existing = await prisma.product.findUnique({
      where: { code },
      select: { id: true },
    });

    if (!existing) {
      return NextResponse.json(
        { message: "Product not found", code },
        { status: 404 },
      );
    }

    // ---- upsert master ตามที่ส่งมา ----
    const brandId = body.brandName
      ? await upsertByName("brand", cleanName(body.brandName))
      : null;

    const sizeId = body.Size
      ? await upsertByName("size", cleanName(body.Size))
      : null;

    const comRateId = body.ComRate
      ? await upsertByName("comRate", cleanName(body.ComRate))
      : null;

    const rimId = body.Rim
      ? await upsertByName("rim", cleanName(body.Rim))
      : null;

    const familyId = body.Family
      ? await upsertByName("family", cleanName(body.Family))
      : null;

    const groupTypeId = body.GroupType
      ? await upsertByName("groupType", cleanName(body.GroupType))
      : null;

    const productGroupId = body.ProductGroup
      ? await upsertByName("productGroup", cleanName(body.ProductGroup))
      : null;

    // ---- build updateData แบบ partial ----
    const updateData: any = {};

    if (body.name !== undefined) updateData.name = body.name;
    if (body.price !== undefined) updateData.price = Number(body.price);

    if (body.inventory !== undefined) {
      updateData.navStock = Number(body.inventory);
      updateData.portalStock = Number(body.inventory);
    }

    if (body.itemImage !== undefined) {
      updateData.image = toHttpsUrl(body.itemImage);
    }

    if (body.showInPortal !== undefined) {
      updateData.showInPortal = Boolean(body.showInPortal);
    }

    // master relations 
    if (brandId !== null) updateData.brand = { connect: { id: brandId } };
 
    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { message: "No fields to update", code },
        { status: 400 },
      );
    }

    const updated = await prisma.product.update({
      where: { code },
      data: updateData,
      select: {
        id: true,
        code: true,
        name: true,
        price: true,
        navStock: true,
        portalStock: true,
        image: true,
        brand: { select: { id: true, name: true } },
      },
    });

    return NextResponse.json(
      { message: "success", action: "updated", product: updated },
      { status: 200 },
    );
  } catch (error: any) {
    return NextResponse.json(
      {
        message: "Internal Server Error",
        error: error?.message ?? String(error),
      },
      { status: 500 },
    );
  }
}
