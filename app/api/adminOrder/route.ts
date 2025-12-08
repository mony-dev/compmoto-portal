import { OrderType, PrismaClient, Prisma } from "@prisma/client";
import axios from "axios";
import { NextResponse } from "next/server";

const prisma = new PrismaClient();

const NAV_URL = process.env.NAV_URL;         
const COMPANY_ID = process.env.COMPANY_ID;   
const NAV_BASIC_AUTH = process.env.NAV_BASIC_AUTH; 

if (!NAV_URL) throw new Error("Missing NAV_URL in env");
if (!COMPANY_ID) throw new Error("Missing COMPANY_ID in env");
if (!NAV_BASIC_AUTH) throw new Error("Missing NAV_BASIC_AUTH in env");

type OrderWithRelations = Prisma.OrderGetPayload<{
  include: {
    user: { include: { saleUser: true } };
    items: { include: { product: true } };
  };
}>;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q") || "";
  const type = searchParams.get("type") || "";
  const userId = searchParams.get("userId") || "";
  const userRole = searchParams.get("role") || "";
  const page = parseInt(searchParams.get("page") || "1", 10);
  const pageSize = parseInt(searchParams.get("pageSize") || "1000", 10);

  if (!userId) {
    return NextResponse.json(
      { error: "User ID is required" },
      { status: 400 }
    );
  }

  const startOfYear = new Date(new Date().getFullYear(), 0, 1);
  const endOfYear = new Date(new Date().getFullYear(), 11, 31, 23, 59, 59, 999);

  try {
    const whereBase: Prisma.OrderWhereInput = {
      type: type ? (type as OrderType) : undefined,
      createdAt: {
        gte: startOfYear,
        lt: endOfYear,
      },
      ...(q
        ? {
            OR: [
              {
                documentNo: {
                  contains: q,
                  mode: "insensitive",
                },
              },
            ],
          }
        : {}),
      ...(userRole === "SALE"
        ? {
            user: {
              saleUserId: parseInt(userId, 10),
            },
          }
        : {}),
    };

    // แยก findMany กับ count เพื่อให้ TS infer type ชัด
    const orders: OrderWithRelations[] = await prisma.order.findMany({
      where: whereBase,
      include: {
        user: {
          include: {
            saleUser: true,
          },
        },
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
    });

    const total = await prisma.order.count({
      where: whereBase,
    });

    if (type !== "Back") {
      return NextResponse.json({ orders, total });
    }

    // ---------- type === 'Back' ----------
    const newOrders = await Promise.all(
      orders.map(async (order) => {
        try {
          const filter = encodeURIComponent(
            `SalesNo eq '${order.documentNo}'`
          );

          const url = `${NAV_URL}/companies(${COMPANY_ID})/api_MasterSalesBlankets?$top=1&$expand=lineInfos&$filter=${filter}`;

          const navRes = await axios.get(url, {
            headers: {
              "Content-Type": "application/json",
              Authorization: NAV_BASIC_AUTH,
            },
          });

          const navValues = navRes.data?.value ?? [];
          if (!navValues.length) {
            return { ...order, conutItem: 0 };
          }

          const salesInfo = navValues[0];
          const lineInfos: any[] = Array.isArray(salesInfo.lineInfos)
            ? salesInfo.lineInfos
            : [];

          const lineItems = lineInfos.map((lineInfo) => ({
            itemNo: lineInfo.ItemNo as string,
            madeToOrder: Number(lineInfo.MadeToOrder ?? 0),
          }));

          let conutItem = 0;

          order.items.forEach((item) => {
            const matchingLineItem = lineItems.find(
              (li) =>
                li.itemNo === item.product.code &&
                li.madeToOrder === item.amount
            );

            if (!matchingLineItem) {
              conutItem += 1;
            }
          });

          return { ...order, conutItem };
        } catch (error) {
          console.error(
            `Error fetching NAV blanket for order ${order.documentNo}:`,
            error
          );
          return { ...order, conutItem: 0 };
        }
      })
    );

    const filteredOrders = newOrders.filter((order) => order.conutItem !== 0);

    return NextResponse.json({
      orders: filteredOrders,
      total: filteredOrders.length,
    });
  } catch (error) {
    console.error("Error in GET /orders:", error);
    return NextResponse.json({ error }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
