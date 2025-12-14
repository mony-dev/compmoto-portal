// import { OrderType, PrismaClient } from "@prisma/client";
// import { NextResponse } from "next/server";
// const prisma = new PrismaClient();

// export async function GET(request: Request) {
//   const { searchParams } = new URL(request.url);
//   const q = searchParams.get('q') || '';
//   const userId = searchParams.get('userId') || '';
//   const userRole = searchParams.get('role') || '';
//   const page = parseInt(searchParams.get("page") || "1");
//   const pageSize = parseInt(searchParams.get("pageSize") || "1000");
//   if (!userId) {
//       return NextResponse.json({ error: "User ID is required" }, { status: 400 });
//   }

//   const startOfYear = new Date(new Date().getFullYear(), 0, 1); 
//   const endOfYear = new Date(new Date().getFullYear(), 11, 31, 23, 59, 59, 999);

//   try {
//     const [orders, total] = await Promise.all([
//       prisma.invoice.findMany({
//         where: {
//           OR: q ? [
//             {
//               documentNo: {
//                 contains: q, 
//                 mode: 'insensitive', 
//               },
//             }
//           ] : undefined,
//           createdAt: {
//             gte: startOfYear,
//             lt: endOfYear,
//           },
//           ...(userRole === 'SALE' && {
//             user: {
//               saleUserId: parseInt(userId),
//             }
//           }),
//         },
//         include: {
//           user: {
//               include: {
//                 saleUser: true,
//               },
//           },
//           items: {
//             include: {
//               product: true,
//             },
//           },
//         },
//         skip: (page - 1) * pageSize,
//         take: pageSize,
//         orderBy: {
//           createdAt: 'desc',
//         },
//       }),
//       prisma.invoice.count({
//         where: {
//           OR: q ? [
//             {
//               documentNo: {
//                 contains: q, 
//                 mode: 'insensitive', 
//               },
//             }
//           ] : undefined,
//           createdAt: {
//             gte: startOfYear,
//             lt: endOfYear,
//           },
//           ...(userRole === 'SALE' && {
//             user: {
//               saleUserId: parseInt(userId),
//             }
//           }),
//         },
//       }),
//     ]);
//     return NextResponse.json({ orders: orders, total });
//   } catch (error) {
//     return NextResponse.json(error);
//   } finally {
//     await prisma.$disconnect();
//   }
// }

import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";

// ✅ Prisma singleton (กัน create/disconnect ทุก request)
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    // log: ["error", "warn"], // เปิดได้ถ้าจะ debug
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

// ✅ clamp helper
function clampInt(value: number, min: number, max: number) {
  if (!Number.isFinite(value)) return min;
  return Math.min(max, Math.max(min, value));
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    const q = (searchParams.get("q") || "").trim();
    const userId = (searchParams.get("userId") || "").trim();
    const userRole = (searchParams.get("role") || "").trim();

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    }

    // ✅ parse + clamp pagination
    const pageRaw = parseInt(searchParams.get("page") || "1", 10);
    const pageSizeRaw = parseInt(searchParams.get("pageSize") || "10", 10);

    const page = clampInt(pageRaw, 1, 10_000);
    const pageSize = clampInt(pageSizeRaw, 1, 100); // ✅ max 100 พอ (กันโหลดหนัก)

    const startOfYear = new Date(new Date().getFullYear(), 0, 1);
    const endOfYear = new Date(
      new Date().getFullYear(),
      11,
      31,
      23,
      59,
      59,
      999
    );

    const where = {
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
      createdAt: {
        gte: startOfYear,
        lt: endOfYear,
      },
      ...(userRole === "SALE"
        ? {
            user: {
              saleUserId: parseInt(userId, 10),
            },
          }
        : {}),
    };

    const [orders, total] = await Promise.all([
      prisma.invoice.findMany({
        where,
        include: {
          user: {
            include: { saleUser: true },
          },
          items: {
            include: { product: true },
          },
        },
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { createdAt: "desc" },
      }),
      prisma.invoice.count({ where }),
    ]);

    return NextResponse.json({
      orders,
      total,
      page,
      pageSize,
    });
  } catch (error: any) {
    console.error("Error in GET /api/adminInvoice:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
