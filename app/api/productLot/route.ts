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

type LotItem = { lot: string; qty?: number };
type ProductLotPatchItem = { itemNo: string; lots: LotItem[] };

function buildYearsFromLots(lots: LotItem[]) {
  const years = [
    { year: "2019", discount: 0, isActive: false, isDisable: true },
    { year: "2020", discount: 0, isActive: false, isDisable: true },
    { year: "2021", discount: 0, isActive: false, isDisable: true },
    { year: "2022", discount: 0, isActive: false, isDisable: true },
    { year: "2023", discount: 0, isActive: false, isDisable: true },
    { year: "2024", discount: 0, isActive: false, isDisable: true },
  ];

  for (const l of lots) {
    const lotNo = String(l?.lot ?? "").trim();
    if (!lotNo) continue;

    // ✅ logic เดิม
    if (lotNo.includes("G") || lotNo.includes("19")) {
      years[0].isActive = true;
      years[0].isDisable = false;
    }
    if (lotNo.includes("H") || lotNo.includes("20")) {
      years[1].isActive = true;
      years[1].isDisable = false;
    }
    if (lotNo.includes("I") || lotNo.includes("21")) {
      years[2].isActive = true;
      years[2].isDisable = false;
    }
    if (lotNo.includes("J") || lotNo.includes("22")) {
      years[3].isActive = true;
      years[3].isDisable = false;
    }
    if (lotNo.includes("K") || lotNo.includes("23")) {
      years[4].isActive = true;
      years[4].isDisable = false;
    }
  }

  return years;
}

export async function PATCH(request: NextRequest) {
  const tokenPayload = verifyToken(request);
  if (!tokenPayload) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = (await request.json()) as ProductLotPatchItem[];

    if (!Array.isArray(body) || body.length === 0) {
      return NextResponse.json({ message: "Body must be a non-empty array" }, { status: 400 });
    }

    // รวม itemNo ทั้งหมดไปหา product ทีเดียว
    const itemNos = body
      .map((x) => String(x?.itemNo ?? "").trim())
      .filter(Boolean);

    if (itemNos.length === 0) {
      return NextResponse.json({ message: "itemNo is required" }, { status: 400 });
    }

    const existingProducts = await prisma.product.findMany({
      where: { code: { in: itemNos } },
      select: { id: true, code: true },
    });

    const codeToId = new Map(existingProducts.map((p) => [p.code, p.id]));

    const results: Array<{
      itemNo: string;
      status: "updated" | "not_found" | "skipped" | "error";
      reason?: string;
    }> = [];

    const tx: any[] = [];

    for (const item of body) {
      const itemNo = String(item?.itemNo ?? "").trim();
      if (!itemNo) {
        results.push({ itemNo: "", status: "skipped", reason: "missing itemNo" });
        continue;
      }

      const productId = codeToId.get(itemNo);
      if (!productId) {
        results.push({ itemNo, status: "not_found" });
        continue;
      }

      const lots = Array.isArray(item?.lots) ? item.lots : [];
      const years = buildYearsFromLots(lots);

      // ✅ อัปเดต years (เหมือนสคริปต์เดิม)
      tx.push(
        prisma.product.update({
          where: { id: productId },
          data: { years: JSON.stringify(years) },
        }),
      );

      results.push({ itemNo, status: "updated" });

      // (Optional) ถ้าคุณอยากเก็บ raw lots ด้วย ต้องมี field ใน Product เช่น lotJson
      // tx.push(prisma.product.update({ where: { id: productId }, data: { lotJson: JSON.stringify(lots) } }))
    }

    if (tx.length > 0) {
      await prisma.$transaction(tx);
    }

    return NextResponse.json(
      {
        message: "success",
        total: body.length,
        updated: results.filter((r) => r.status === "updated").length,
        notFound: results.filter((r) => r.status === "not_found").length,
        skipped: results.filter((r) => r.status === "skipped").length,
        results,
      },
      { status: 200 },
    );
  } catch (error: any) {
    return NextResponse.json(
      { message: "Internal Server Error", error: error?.message ?? String(error) },
      { status: 500 },
    );
  }
}
