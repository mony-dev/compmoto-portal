// import { OrderType, PrismaClient } from "@prisma/client";
// import axios from "axios";
// import { NextResponse } from "next/server";

// const prisma = new PrismaClient();

// const NAV_URL = process.env.NAV_URL;
// const COMPANY_ID = process.env.COMPANY_ID;
// const NAV_BASIC_AUTH = process.env.NAV_BASIC_AUTH; 

// if (!NAV_URL) throw new Error("Missing NAV_URL");
// if (!COMPANY_ID) throw new Error("Missing COMPANY_ID");
// if (!NAV_BASIC_AUTH) throw new Error("Missing NAV_BASIC_AUTH");

// export async function POST(request: Request) {
//   const data = await request.json();
//   try {
//     const createOrder = await prisma.order.create({
//       data: {
//         userId: Number(data.userId),
//         totalAmount: data.totalAmount,
//         totalPrice: data.totalPrice,
//         subTotal: data.subTotal,
//         groupDiscount: data.groupDiscount,
//         type: data.type,
//         externalDocument: data.externalDocument,
//         documentNo: "test",
//       },
//     });

//     const user = await prisma.user.findUnique({
//       where: {
//         id: Number(data.userId),
//       },
//     });

//     const baseUrl = "https://portal.comp-moto.com/th/admin/";
//     const link =
//       data.type === "normal"
//         ? `${baseUrl}normalOrder/${createOrder.id}`
//         : `${baseUrl}backOrder/${createOrder.id}`;

//     const message = `Web Portal : มีออเดอร์สั่งซื้อ จาก ${user?.custNo} \n ${link}`;

//     const lineToken = process.env.LINE_ACCESS_TOKEN;
//     const lineUserId = process.env.LINE_USER_ID;
//     if (lineToken && lineUserId) {
//       await sendLineNotification(lineToken, message, lineUserId);
//     }

//     return NextResponse.json(createOrder);
//   } catch (error) {
//     return NextResponse.json(error);
//   } finally {
//     await prisma.$disconnect();
//   }
// }

// async function sendLineNotification(
//   token: string,
//   message: string,
//   userId: string
// ) {
//   const response = await fetch("https://api.line.me/v2/bot/message/push", {
//     method: "POST",
//     headers: {
//       "Content-Type": "application/json",
//       Authorization: `Bearer ${token}`,
//     },
//     body: JSON.stringify({
//       to: userId,
//       messages: [
//         {
//           type: "text",
//           text: message,
//         },
//       ],
//     }),
//   });

//   if (!response.ok) {
//     const error = await response.json();
//     throw new Error(`Failed to send LINE notification: ${error.message}`);
//   }
// }

// export async function GET(request: Request) {
//   const { searchParams } = new URL(request.url);
//   const q = searchParams.get("q") || "";
//   const type = searchParams.get("type") || "";
//   const userId = searchParams.get("userId") || "";
//   const page = parseInt(searchParams.get("page") || "1");
//   const pageSize = parseInt(searchParams.get("pageSize") || "30");

//   if (!userId) {
//     return NextResponse.json(
//       { error: "User ID is required" },
//       { status: 400 }
//     );
//   }

//   const startOfYear = new Date(new Date().getFullYear(), 0, 1);
//   const endOfYear = new Date(
//     new Date().getFullYear(),
//     11,
//     31,
//     23,
//     59,
//     59,
//     999
//   );

//   try {
//     const [orders, total] = await Promise.all([
//       prisma.order.findMany({
//         where: {
//           userId: Number(userId),
//           type: type ? (type as OrderType) : undefined,
//           OR: q
//             ? [
//                 {
//                   documentNo: {
//                     contains: q,
//                     mode: "insensitive",
//                   },
//                 },
//               ]
//             : undefined,
//           createdAt: {
//             gte: startOfYear,
//             lt: endOfYear,
//           },
//         },
//         include: {
//           user: true,
//           items: {
//             include: {
//               product: true,
//             },
//           },
//         },
//         skip: (page - 1) * pageSize,
//         take: pageSize,
//         orderBy: {
//           createdAt: "desc",
//         },
//       }),
//       prisma.order.count({
//         where: {
//           userId: Number(userId),
//           type: type ? (type as OrderType) : undefined,
//           OR: q
//             ? [
//                 {
//                   documentNo: {
//                     contains: q,
//                     mode: "insensitive",
//                   },
//                 },
//               ]
//             : undefined,
//           createdAt: {
//             gte: startOfYear,
//             lt: endOfYear,
//           },
//         },
//       }),
//     ]);

//     if (type === "Back") {
//       const newOrders = await Promise.all(
//         orders.map(async (order) => {
//           try {
//             const filter = encodeURIComponent(
//               `SalesNo eq '${order.documentNo}'`
//             );

//             const url = `${NAV_URL}/companies(${COMPANY_ID})/api_MasterSalesBlankets?$top=1&$expand=lineInfos&$filter=${filter}`;

//             const navRes = await axios.get(url, {
//               headers: {
//                 "Content-Type": "application/json",
//                 Authorization: NAV_BASIC_AUTH,
//               },
//             });

//             const values = navRes.data?.value ?? [];
//             if (!values.length) {
//               return { ...order, conutItem: 0 };
//             }

//             const salesInfo = values[0];
//             const lineInfos: any[] = Array.isArray(salesInfo.lineInfos)
//               ? salesInfo.lineInfos
//               : [];

//             const lineItems = lineInfos.map((lineInfo) => ({
//               itemNo: lineInfo.ItemNo as string,
//               itemName: lineInfo.ItemName as string,
//               qty: Number(lineInfo.Qty ?? 0),
//               lineAmount: Number(lineInfo.LineAmount ?? 0),
//               lineDiscount: Number(lineInfo.LineDiscount ?? 0),
//               lineDiscountPc: Number(lineInfo.LineDiscountPc ?? 0),
//               lineAmtAfterDiscount: Number(lineInfo.LineAmtAfterDiscount ?? 0),
//               qtyToShip: Number(lineInfo.QtytoShip ?? 0),
//               qtyShipped: Number(lineInfo.QtytoShiped ?? 0),
//               madeToOrder: Number(lineInfo.MadeToOrder ?? 0),
//             }));

//             let conutItem = 0;
//             order.items.forEach((item) => {
//               const match = lineItems.find(
//                 (li) =>
//                   li.itemNo === item.product.code &&
//                   li.madeToOrder === item.amount
//               );

//               if (!match) {
//                 conutItem += 1;
//               }
//             });

//             return { ...order, conutItem };
//           } catch (err) {
//             console.error(
//               `Error fetching NAV blanket for order ${order.documentNo}:`,
//               err
//             );
//             return { ...order, conutItem: 0 };
//           }
//         })
//       );

//       const filteredOrders = newOrders.filter(
//         (order) => order.conutItem !== 0
//       );
//       return NextResponse.json({
//         orders: filteredOrders,
//         total: filteredOrders.length,
//       });
//     }

//     return NextResponse.json({ orders, total });
//   } catch (error) {
//     console.error("GET /orders error:", error);
//     return NextResponse.json(
//       { error: "Internal Server Error", details: error },
//       { status: 500 }
//     );
//   } finally {
//     await prisma.$disconnect();
//   }
// }


import { OrderType, Prisma, PrismaClient } from "@prisma/client";
import axios from "axios";
import pLimit from "p-limit";
import { NextResponse } from "next/server";

/**
 * ✅ Prisma singleton
 */
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };
const prisma = globalForPrisma.prisma ?? new PrismaClient();
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

const NAV_URL = process.env.NAV_URL;
const COMPANY_ID = process.env.COMPANY_ID;
const NAV_BASIC_AUTH = process.env.NAV_BASIC_AUTH;

if (!NAV_URL) throw new Error("Missing NAV_URL in env");
if (!COMPANY_ID) throw new Error("Missing COMPANY_ID in env");
if (!NAV_BASIC_AUTH) throw new Error("Missing NAV_BASIC_AUTH in env");

// ✅ nav axios with timeout
const navHttp = axios.create({
  timeout: 20_000,
  headers: {
    "Content-Type": "application/json",
    Authorization: NAV_BASIC_AUTH,
  },
});

// ✅ concurrency guard
const NAV_CONCURRENCY = Number(process.env.NAV_CONCURRENCY ?? 5);
const limitNav = pLimit(Number.isFinite(NAV_CONCURRENCY) ? NAV_CONCURRENCY : 5);

// ✅ clamp helper
function clampInt(value: number, min: number, max: number) {
  if (!Number.isFinite(value)) return min;
  return Math.min(max, Math.max(min, value));
}

type OrderWithRelations = Prisma.OrderGetPayload<{
  include: {
    user: true;
    items: { include: { product: true } };
  };
}>;

export async function POST(request: Request) {
  const data = await request.json();
  try {
    const createOrder = await prisma.order.create({
      data: {
        userId: Number(data.userId),
        totalAmount: data.totalAmount,
        totalPrice: data.totalPrice,
        subTotal: data.subTotal,
        groupDiscount: data.groupDiscount,
        type: data.type,
        externalDocument: data.externalDocument,
        documentNo: "test",
      },
    });

    const user = await prisma.user.findUnique({
      where: {
        id: Number(data.userId),
      },
    });

    const baseUrl = "https://portal.comp-moto.com/th/admin/";
    const link =
      data.type === "normal"
        ? `${baseUrl}normalOrder/${createOrder.id}`
        : `${baseUrl}backOrder/${createOrder.id}`;

    const message = `Web Portal : มีออเดอร์สั่งซื้อ จาก ${user?.custNo} \n ${link}`;

    const lineToken = process.env.LINE_ACCESS_TOKEN;
    const lineUserId = process.env.LINE_USER_ID;
    if (lineToken && lineUserId) {
      await sendLineNotification(lineToken, message, lineUserId);
    }

    return NextResponse.json(createOrder);
  } catch (error) {
    return NextResponse.json(error);
  } finally {
    await prisma.$disconnect();
  }
}

async function sendLineNotification(
  token: string,
  message: string,
  userId: string
) {
  const response = await fetch("https://api.line.me/v2/bot/message/push", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      to: userId,
      messages: [
        {
          type: "text",
          text: message,
        },
      ],
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Failed to send LINE notification: ${error.message}`);
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    const q = (searchParams.get("q") || "").trim();
    const typeRaw = (searchParams.get("type") || "").trim();
    const userIdRaw = (searchParams.get("userId") || "").trim();

    if (!userIdRaw) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    }

    const userId = Number.parseInt(userIdRaw, 10);
    if (!Number.isFinite(userId)) {
      return NextResponse.json({ error: "Invalid userId" }, { status: 400 });
    }

    const page = clampInt(Number.parseInt(searchParams.get("page") || "1", 10), 1, 10_000);
    const pageSize = clampInt(
      Number.parseInt(searchParams.get("pageSize") || "10", 10),
      1,
      Number(process.env.ORDER_MAX_PAGE_SIZE ?? 50)
    );

    // ✅ ปีนี้เหมือนเดิม
    const year = new Date().getFullYear();
    const startOfYear = new Date(year, 0, 1);
    const endOfYear = new Date(year, 11, 31, 23, 59, 59, 999);

    const whereBase: Prisma.OrderWhereInput = {
      userId,
      createdAt: { gte: startOfYear, lt: endOfYear },
      type: typeRaw ? (typeRaw as OrderType) : undefined,
      ...(q
        ? {
            OR: [
              {
                documentNo: { contains: q, mode: "insensitive" },
              },
            ],
          }
        : {}),
    };

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where: whereBase,
        include: {
          user: true,
          items: { include: { product: true } },
        },
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { createdAt: "desc" },
      }),
      prisma.order.count({ where: whereBase }),
    ]);

    // ✅ ปกติไม่แตะ NAV
    if (typeRaw !== "Back") {
      return NextResponse.json({ orders, total, page, pageSize });
    }

    // ✅ type=Back แตะ NAV แบบจำกัด concurrency + timeout + ไม่ให้ทั้งชุดล้ม
    const newOrders = await Promise.all(
      (orders as OrderWithRelations[]).map((order) =>
        limitNav(async () => {
          try {
            const filter = encodeURIComponent(`SalesNo eq '${order.documentNo}'`);
            const url =
              `${NAV_URL}/companies(${COMPANY_ID})/api_MasterSalesBlankets` +
              `?$top=1&$expand=lineInfos&$filter=${filter}`;

            const navRes = await navHttp.get(url);
            const values = navRes.data?.value ?? [];

            if (!values.length) return { ...order, conutItem: 0 };

            const salesInfo = values[0];
            const lineInfos: any[] = Array.isArray(salesInfo.lineInfos) ? salesInfo.lineInfos : [];

            const lineItems = lineInfos.map((lineInfo) => ({
              itemNo: String(lineInfo.ItemNo ?? ""),
              madeToOrder: Number(lineInfo.MadeToOrder ?? 0),
            }));

            let conutItem = 0;
            for (const item of order.items) {
              const code = item?.product?.code;
              const amount = item?.amount;

              const match = lineItems.find(
                (li) => li.itemNo === code && li.madeToOrder === amount
              );
              if (!match) conutItem += 1;
            }

            return { ...order, conutItem };
          } catch (err: any) {
            console.error(
              `NAV blanket failed for order ${order.documentNo}:`,
              err?.message ?? err
            );
            return { ...order, conutItem: 0 };
          }
        })
      )
    );

    const filteredOrders = newOrders.filter((o: any) => o.conutItem !== 0);

    return NextResponse.json({
      orders: filteredOrders,
      total: filteredOrders.length,
      page,
      pageSize,
      navConcurrency: NAV_CONCURRENCY,
    });
  } catch (error: any) {
    console.error("Error in GET /api/order:", error);
    return NextResponse.json(
      { error: error?.message ?? "Internal Server Error" },
      { status: 500 }
    );
  }
}
