import { PrismaClient } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { exec } from "child_process";
import { promisify } from "util";

/**
 * ✅ Prisma singleton (Next.js best practice)
 */
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };
const prisma = globalForPrisma.prisma ?? new PrismaClient();
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

const execPromise = promisify(exec);

// ✅ clamp helper
function clampInt(value: number, min: number, max: number) {
  if (!Number.isFinite(value)) return min;
  return Math.min(max, Math.max(min, value));
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    const q = (searchParams.get("q") || "").trim();
    const userIdRaw = (searchParams.get("userId") || "").trim();

    if (!userIdRaw) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    }

    const userId = Number.parseInt(userIdRaw, 10);
    if (!Number.isFinite(userId)) {
      return NextResponse.json({ error: "Invalid userId" }, { status: 400 });
    }

    const pageRaw = Number.parseInt(searchParams.get("page") || "1", 10);
    const pageSizeRaw = Number.parseInt(searchParams.get("pageSize") || "10", 10);

    const page = clampInt(pageRaw, 1, 10_000);
    const pageSize = clampInt(pageSizeRaw, 1, 100);

    // ✅ จำกัดข้อมูลเฉพาะปีนี้เหมือน admin
    const year = new Date().getFullYear();
    const startOfYear = new Date(year, 0, 1);
    const endOfYear = new Date(year, 11, 31, 23, 59, 59, 999);

    const where = {
      userId,
      createdAt: { gte: startOfYear, lt: endOfYear },
      ...(q
        ? {
            OR: [
              {
                documentNo: {
                  contains: q,
                  mode: "insensitive" as const,
                },
              },
            ],
          }
        : {}),
    };

    const [orders, total] = await Promise.all([
      prisma.invoice.findMany({
        where,
        include: {
          user: true,
          items: { include: { product: true } },
        },
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { createdAt: "desc" },
      }),
      prisma.invoice.count({ where }),
    ]);

    return NextResponse.json({ orders, total, page, pageSize });
  } catch (error: any) {
    console.error("Error in GET /api/invoice:", error);
    return NextResponse.json(
      { error: error?.message ?? "Internal Server Error" },
      { status: 500 }
    );
  }
}
// close Provider API
const JWT_SECRET = process.env.JWT_SECRET || "nav-secret-key";

function verifyToken(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null;
  }
  const token = authHeader.split(" ")[1];
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch {
    return null;
  }
}

export async function POST(request: NextRequest) {
  const tokenPayload = verifyToken(request);
  if (!tokenPayload) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const data = await request.json();
    // Step 1 : Find userId based on custNo
    const user = await prisma.user.findFirst({
      where: { custNo: data.custNo },
      include: {
        customerGroup: true,
      },
    });

    if (!user) {
      console.error(`User with customer number ${data.custNo} not found.`);
      return;
    }
    const userId = user.id;
    // Step 2: Calculate Total Qty
    const lineItems = data.items;
    let totalQty = 0;
    let subTotal = 0;
    for (const item of lineItems) {
      const qty = parseInt(item.qty, 10);
      const lineAmount = parseInt(item.lineAmount, 10);
      totalQty += qty;
      subTotal += lineAmount;
    }
    const postingDate = new Date(data.date);
    // Step 3: Save Invoice Data
    const newInvoice = await prisma.invoice.create({
      data: {
        userId,
        documentNo: data.invoiceNo,
        date: postingDate,
        totalPrice: parseFloat(data.totalAmount),
        subTotal: subTotal,
        totalAmount: totalQty, // Add the calculated total quantity here
        groupDiscount: user.customerGroup?.discount ?? 0,
        externalDocument: data.description,
      },
    });

    // Step 4: Save Invoice Items
    for (const item of lineItems) {
      const itemNo = item.ItemNo;
      const qty = parseInt(item.qty, 10);
      const lineAmount = parseFloat(item.lineAmount);
      const lineDiscountPc = parseFloat(item.lineDiscountPc);
      const discountPc = parseFloat(item.lineAmtAfterDiscount);

      // Find productId based on itemNo (product code)
      const product = await prisma.product.findUnique({
        where: { code: item.itemNo },
      });

      if (!product) {
        console.error(`Product with item number ${itemNo} not found.`);
        continue;
      }

      // Check if newInvoice.id and product.id already exists
      const existingItem = await prisma.invoiceItem.findUnique({
        where: {
          invoiceId_productId: {
            invoiceId: newInvoice.id,
            productId: product.id,
          },
        },
      });
      if (existingItem) {
        // Update the invoice item
        const updatedItem = await prisma.invoiceItem.update({
          where: {
            invoiceId_productId: {
              invoiceId: newInvoice.id,
              productId: product.id,
            },
          },
          data: {
            amount: existingItem.amount + qty, // Add old amount with new amount
            price: existingItem.price + lineAmount / qty, // Add old price with new price
            discountPrice: existingItem.discountPrice + discountPc,
          },
        });
      } else {
        // Save the invoice item
        const itemCreate = await prisma.invoiceItem.create({
          data: {
            invoiceId: newInvoice.id,
            productId: product.id,
            amount: qty,
            price: lineAmount / qty,
            discount: lineDiscountPc,
            discountPrice: discountPc,
          },
        });
      }
    }
    // Step 5: Update totalPrice on newInvoice by summing discountPrice inside invoiceItem
    const sumOfDiscountPrices = await prisma.invoiceItem.aggregate({
      where: { invoiceId: newInvoice.id },
      _sum: {
        discountPrice: true,
      },
    });

    await prisma.invoice.update({
      where: { id: newInvoice.id },
      data: {
        totalPrice: sumOfDiscountPrices._sum.discountPrice || 0, 
      },
    });

    setTimeout(() => {
      fetch(`${process.env.DOMAIN_URL}/api/scripts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      }).then(() => {
        console.log("Trigger background script success");
      }).catch(console.error);
    }, 0);

    return NextResponse.json({ invoice: "success" });

  } catch (error) {
    return NextResponse.json(error);
  } finally {
    await prisma.$disconnect();
  }
}
