import { PrismaClient } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";

/**
 * ✅ Prisma singleton
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

type MadeToOrderPatchBody = {
  documentNo: string;
  items: Array<{ itemNo: string; madeToOrder: number }>;
};

export async function PATCH(request: NextRequest) {
  const tokenPayload = verifyToken(request);
  if (!tokenPayload) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = (await request.json()) as MadeToOrderPatchBody;

    const documentNo = String(body?.documentNo ?? "").trim();
    if (!documentNo) {
      return NextResponse.json({ message: "documentNo is required" }, { status: 400 });
    }

    if (!Array.isArray(body?.items) || body.items.length === 0) {
      return NextResponse.json({ message: "items must be a non-empty array" }, { status: 400 });
    }

    // normalize items (ตัดค่าว่าง/ค่าติดลบ)
    const normalized = body.items
      .map((x) => ({
        itemNo: String(x?.itemNo ?? "").trim(),
        madeToOrder: Number(x?.madeToOrder ?? 0),
      }))
      .filter((x) => x.itemNo);

    if (normalized.length === 0) {
      return NextResponse.json({ message: "items.itemNo is required" }, { status: 400 });
    }

    for (const it of normalized) {
      if (!Number.isFinite(it.madeToOrder) || it.madeToOrder < 0) {
        return NextResponse.json(
          { message: `madeToOrder must be a non-negative number (itemNo=${it.itemNo})` },
          { status: 400 },
        );
      }
    }

    // 1) หา order ตาม documentNo
    const order = await prisma.order.findFirst({
      where: { documentNo },
      select: { id: true, documentNo: true },
    });

    if (!order) {
      return NextResponse.json({ message: "Order not found", documentNo }, { status: 404 });
    }

    // 2) หา productId ตาม itemNo (Product.code)
    const itemNos = Array.from(new Set(normalized.map((x) => x.itemNo)));

    const products = await prisma.product.findMany({
      where: { code: { in: itemNos } },
      select: { id: true, code: true },
    });

    const codeToProductId = new Map(products.map((p) => [p.code, p.id]));

    // 3) ตรวจว่า order มี orderItem ของ productId นั้นไหม
    const productIds = products.map((p) => p.id);

    const existingOrderItems = await prisma.orderItem.findMany({
      where: {
        orderId: order.id,
        productId: { in: productIds },
      },
      select: { productId: true },
    });

    const existingProductIdSet = new Set(existingOrderItems.map((x) => x.productId));

    // 4) ทำ update แบบ transaction เฉพาะตัวที่มีจริง
    const tx: any[] = [];
    const results: Array<{
      itemNo: string;
      status: "updated" | "product_not_found" | "order_item_not_found" | "skipped";
      madeToOrder?: number;
    }> = [];

    for (const it of normalized) {
      const productId = codeToProductId.get(it.itemNo);

      if (!productId) {
        results.push({ itemNo: it.itemNo, status: "product_not_found" });
        continue;
      }

      if (!existingProductIdSet.has(productId)) {
        results.push({ itemNo: it.itemNo, status: "order_item_not_found" });
        continue;
      }

      tx.push(
        prisma.orderItem.update({
          where: {
            // @@unique([orderId, productId]) => ใช้ composite unique ได้
            orderId_productId: { orderId: order.id, productId },
          },
          data: { madeToOrder: it.madeToOrder },
        }),
      );

      results.push({ itemNo: it.itemNo, status: "updated", madeToOrder: it.madeToOrder });
    }

    if (tx.length > 0) {
      await prisma.$transaction(tx);
    }

    return NextResponse.json(
      {
        message: "success",
        documentNo,
        orderId: order.id,
        updated: results.filter((r) => r.status === "updated").length,
        productNotFound: results.filter((r) => r.status === "product_not_found").length,
        orderItemNotFound: results.filter((r) => r.status === "order_item_not_found").length,
        results,
      },
      { status: 200 },
    );
  } catch (error: any) {
    // handle not found on update (rare edge)
    if (error?.code === "P2025") {
      return NextResponse.json(
        { message: "Some order items were not found (race condition)", error: error?.message },
        { status: 409 },
      );
    }

    return NextResponse.json(
      { message: "Internal Server Error", error: error?.message ?? String(error) },
      { status: 500 },
    );
  }
}
