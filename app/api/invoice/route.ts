import { PrismaClient } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
const prisma = new PrismaClient();
import jwt from "jsonwebtoken";
import { exec } from "child_process";
import { promisify } from "util";
import path from "path";

const execPromise = promisify(exec);

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q") || "";
  const userId = searchParams.get("userId") || "";
  const page = parseInt(searchParams.get("page") || "1");
  const pageSize = parseInt(searchParams.get("pageSize") || "30");
  if (!userId) {
    return NextResponse.json({ error: "User ID is required" }, { status: 400 });
  }

  try {
    const [orders, total] = await Promise.all([
      prisma.invoice.findMany({
        where: {
          userId: Number(userId),
          OR: q
            ? [
                {
                  documentNo: {
                    contains: q,
                    mode: "insensitive",
                  },
                },
              ]
            : undefined,
        },
        include: {
          user: true,
          items: {
            include: {
              product: true,
            },
          },
        },
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: {
          createdAt: "desc",
        },
      }),
      prisma.invoice.count({
        where: {
          userId: Number(userId),
          OR: q
            ? [
                {
                  documentNo: {
                    contains: q,
                    mode: "insensitive",
                  },
                },
              ]
            : undefined,
        },
      }),
    ]);
    return NextResponse.json({ orders: orders, total });
  } catch (error) {
    return NextResponse.json(error);
  } finally {
    await prisma.$disconnect();
  }
}
// close Provider API
// const JWT_SECRET = process.env.JWT_SECRET || "nav-secret-key";

// function verifyToken(request: NextRequest) {
//   const authHeader = request.headers.get("authorization");
//   if (!authHeader || !authHeader.startsWith("Bearer ")) {
//     return null;
//   }
//   const token = authHeader.split(" ")[1];
//   try {
//     return jwt.verify(token, JWT_SECRET);
//   } catch {
//     return null;
//   }
// }

// export async function POST(request: NextRequest) {
//   const tokenPayload = verifyToken(request);
//   if (!tokenPayload) {
//     return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
//   }

//   try {
//     const data = await request.json();
//     // Step 1 : Find userId based on custNo
//     const user = await prisma.user.findFirst({
//       where: { custNo: data.custNo },
//       include: {
//         customerGroup: true,
//       },
//     });

//     if (!user) {
//       console.error(`User with customer number ${data.custNo} not found.`);
//       return;
//     }
//     const userId = user.id;
//     // Step 2: Calculate Total Qty
//     const lineItems = data.items;
//     let totalQty = 0;
//     let subTotal = 0;
//     for (const item of lineItems) {
//       const qty = parseInt(item.qty, 10);
//       const lineAmount = parseInt(item.lineAmount, 10);
//       totalQty += qty;
//       subTotal += lineAmount;
//     }
//     const postingDate = new Date(data.date);
//     // Step 3: Save Invoice Data
//     const newInvoice = await prisma.invoice.create({
//       data: {
//         userId,
//         documentNo: data.invoiceNo,
//         date: postingDate,
//         totalPrice: parseFloat(data.totalAmount),
//         subTotal: subTotal,
//         totalAmount: totalQty, // Add the calculated total quantity here
//         groupDiscount: user.customerGroup?.discount ?? 0,
//         externalDocument: data.description,
//       },
//     });

//     // Step 4: Save Invoice Items
//     for (const item of lineItems) {
//       const itemNo = item.ItemNo;
//       const qty = parseInt(item.qty, 10);
//       const lineAmount = parseFloat(item.lineAmount);
//       const lineDiscountPc = parseFloat(item.lineDiscountPc);
//       const discountPc = parseFloat(item.lineAmtAfterDiscount);

//       // Find productId based on itemNo (product code)
//       const product = await prisma.product.findUnique({
//         where: { code: item.itemNo },
//       });

//       if (!product) {
//         console.error(`Product with item number ${itemNo} not found.`);
//         continue;
//       }

//       // Check if newInvoice.id and product.id already exists
//       const existingItem = await prisma.invoiceItem.findUnique({
//         where: {
//           invoiceId_productId: {
//             invoiceId: newInvoice.id,
//             productId: product.id,
//           },
//         },
//       });
//       if (existingItem) {
//         // Update the invoice item
//         const updatedItem = await prisma.invoiceItem.update({
//           where: {
//             invoiceId_productId: {
//               invoiceId: newInvoice.id,
//               productId: product.id,
//             },
//           },
//           data: {
//             amount: existingItem.amount + qty, // Add old amount with new amount
//             price: existingItem.price + lineAmount / qty, // Add old price with new price
//             discountPrice: existingItem.discountPrice + discountPc,
//           },
//         });
//       } else {
//         // Save the invoice item
//         const itemCreate = await prisma.invoiceItem.create({
//           data: {
//             invoiceId: newInvoice.id,
//             productId: product.id,
//             amount: qty,
//             price: lineAmount / qty,
//             discount: lineDiscountPc,
//             discountPrice: discountPc,
//           },
//         });
//       }
//     }
//     // Step 5: Update totalPrice on newInvoice by summing discountPrice inside invoiceItem
//     const sumOfDiscountPrices = await prisma.invoiceItem.aggregate({
//       where: { invoiceId: newInvoice.id },
//       _sum: {
//         discountPrice: true,
//       },
//     });

//     await prisma.invoice.update({
//       where: { id: newInvoice.id },
//       data: {
//         totalPrice: sumOfDiscountPrices._sum.discountPrice || 0, 
//       },
//     });

//     setTimeout(() => {
//       fetch(`${process.env.DOMAIN_URL}/api/scripts`, {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' }
//       }).then(() => {
//         console.log("Trigger background script success");
//       }).catch(console.error);
//     }, 0);

//     return NextResponse.json({ invoice: "success" });

//   } catch (error) {
//     return NextResponse.json(error);
//   } finally {
//     await prisma.$disconnect();
//   }
// }
