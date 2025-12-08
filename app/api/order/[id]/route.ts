import { NextResponse } from "next/server";
import { OrderType, PrismaClient } from "@prisma/client";
import axios from "axios";

interface NavLineItem {
  itemNo: string;
  itemName: string;
  qty: number;
  lineAmount: number;
  lineDiscount: number;
  lineDiscountPc: number;
  lineAmtAfterDiscount: number;
  qtyToShip: number;
  qtyShipped: number;
  madeToOrder: number;
}

const prisma = new PrismaClient();

const NAV_URL = process.env.NAV_URL;
const COMPANY_ID = process.env.COMPANY_ID;
const NAV_BASIC_AUTH = process.env.NAV_BASIC_AUTH;

if (!NAV_URL) throw new Error("Missing NAV_URL");
if (!COMPANY_ID) throw new Error("Missing COMPANY_ID");
if (!NAV_BASIC_AUTH) throw new Error("Missing NAV_BASIC_AUTH");

interface dataBodyInterface {
  documentNo: string;
}

export async function PUT(
  request: Request,
  { params, body }: { params: { id: number }; body: any }
) {
  const data = await request.json();
  const id = params.id;
  let dataBody: dataBodyInterface = {
    documentNo: data.documentNo,
  };

  try {
    const updatedOrder = await prisma.order.update({
      where: {
        id: Number(id),
      },
      data: dataBody,
    });
    return NextResponse.json(updatedOrder);
  } catch (error) {
    return NextResponse.json(error);
  } finally {
    await prisma.$disconnect();
  }
}

// export async function GET(
//   request: Request,
//   { params }: { params: { id: number } }
// ) {
//   const { searchParams } = new URL(request.url);
//   const id = params.id;
//   const type = searchParams.get('type') || '';
//   try {
//     const order = await prisma.order.findUnique({
//       where: {
//         id: Number(id),
//         type: type ? (type as OrderType) : undefined,
//       },
//       include: {
//         user: {
//           include: {
//             saleUser: true,
//           },
//         },
//         items: {
//           include: {
//             product: {
//               include: { imageProducts: true} ,
//             }
//           },
//         },
//       },
//     });
//     return NextResponse.json(order);
//   } catch (error) {
//     return NextResponse.json(error);
//   } finally {
//     await prisma.$disconnect();
//   }
// }

export async function GET(request: Request, { params }: { params: { id: number } }) {
  const { searchParams } = new URL(request.url);
  const id = params.id;
  const type = searchParams.get("type") || "";

  try {
    const order = await prisma.order.findUnique({
      where: {
        id: Number(id),
        type: type ? (type as OrderType) : undefined,
      },
      include: {
        user: {
          include: {
            saleUser: true,
          },
        },
        items: {
          include: {
            product: {
              include: { imageProducts: true },
            },
          },
        },
      },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // ถ้า Normal ไม่ต้องคุยกับ NAV
    if (type === "Normal") {
      return NextResponse.json(order);
    }

    const filter = encodeURIComponent(`SalesNo eq '${order.documentNo}'`);
    const url =
      `${NAV_URL}/companies(${COMPANY_ID})/api_MasterSalesBlankets?$top=1&$expand=lineInfos&$filter=${filter}`;

    const navRes = await axios.get(url, {
      headers: {
        "Content-Type": "application/json",
        Authorization: NAV_BASIC_AUTH,
      },
    });

    const values = navRes.data?.value ?? [];
    if (!values.length) {
      return NextResponse.json({ error: "NAV blanket data not found" }, { status: 404 });
    }

    const navInfo = values[0];
    const lineInfos = Array.isArray(navInfo.lineInfos) ? navInfo.lineInfos : [];

    const navItems: NavLineItem[] = lineInfos.map((row: any) => ({
      itemNo: row.ItemNo,
      itemName: row.ItemName,
      qty: Number(row.Qty ?? 0),
      lineAmount: Number(row.LineAmount ?? 0),
      lineDiscount: Number(row.LineDiscount ?? 0),
      lineDiscountPc: Number(row.LineDiscountPc ?? 0),
      lineAmtAfterDiscount: Number(row.LineAmtAfterDiscount ?? 0),
      qtyToShip: Number(row.QtytoShip ?? 0),
      qtyShipped: Number(row.QtytoShiped ?? 0),
      madeToOrder: Number(row.MadeToOrder ?? 0),
    }));
    // ---------------------------
    // Filter เฉพาะรายการที่ไม่ match NAV
    // ---------------------------
    const filteredItems = order.items
      .map((item) => {
        // ไอเท็มที่ match ทั้ง itemNo และ madeToOrder
        const matched = navItems.find(
          (nav: NavLineItem) =>
            nav.itemNo === item.product.code &&
            nav.madeToOrder === item.amount
        );

        if (matched) return null;

        // หา madeToOrder เผื่อโชว์ใน UI
        const navMatchItem = navItems.find(
          (nav: NavLineItem) => nav.itemNo === item.product.code
        );
        return {
          ...item,
          madeToOrder: navMatchItem ? navMatchItem.madeToOrder : 0,
        };
      })
      .filter(Boolean);

    const finalOrder = {
      ...order,
      items: filteredItems,
    };

    return NextResponse.json(finalOrder);
  } catch (error) {
    console.error("GET BackOrder error:", error);
    return NextResponse.json(
      { error: "Internal Server Error", detail: error },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
