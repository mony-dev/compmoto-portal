import { OrderType, PrismaClient } from "@prisma/client";
import axios from "axios";
import { NextResponse } from "next/server";
import { parseStringPromise } from "xml2js";
const prisma = new PrismaClient();

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q') || '';
  const type = searchParams.get('type') || '';
  const userId = searchParams.get('userId') || '';
  const userRole = searchParams.get('role') || '';
  const page = parseInt(searchParams.get("page") || "1");
  const pageSize = parseInt(searchParams.get("pageSize") || "1000");
  if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 });
  }

  const startOfYear = new Date(new Date().getFullYear(), 0, 1); 
  const endOfYear = new Date(new Date().getFullYear(), 11, 31, 23, 59, 59, 999);

  try {
    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where: {
          type: type ? (type as OrderType) : undefined,
          OR: q ? [
            {
              documentNo: {
                contains: q, 
                mode: 'insensitive', 
              },
            }
          ] : undefined,
          createdAt: {
            gte: startOfYear,
            lt: endOfYear,
          },
          ...(userRole === 'SALE' && {
            user: {
              saleUserId: parseInt(userId),
            }
          }),
        },
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
          createdAt: 'desc',
        },
      }),
      prisma.order.count({
        where: {
          type: type ? (type as OrderType) : undefined,
          OR: q ? [
            {
              documentNo: {
                contains: q, 
                mode: 'insensitive', 
              },
            }
          ] : undefined,
          createdAt: {
            gte: startOfYear,
            lt: endOfYear,
          },
          ...(userRole === 'SALE' && {
            user: {
              saleUserId: parseInt(userId),
            }
          }),
        },
      }),
    ]);
    if (type === 'Back') {
      // Ensure we correctly resolve all promises before filtering
      const newOrders = await Promise.all(
        orders.map(async (order) => {
          try {
            const soapRequest = await axios({
              method: "get",
              url: process.env.NAV_URL,
              headers: {
                SOAPACTION: "MasterSalesBlanket",
                "Content-Type": "application/xml",
                Authorization: "Basic QURNMDFAY21jLmNvbTpDb21wbW90bzkq",
              },
              data: `<?xml version="1.0" encoding="UTF-8"?>
                <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:wsc="urn:microsoft-dynamics-schemas/codeunit/WSIntegration">
                  <soapenv:Header/>
                  <soapenv:Body>
                    <wsc:MasterSalesBlanket>
                        <wsc:p_gBlanketNo>${order.documentNo}</wsc:p_gBlanketNo>
                        <wsc:p_oSales></wsc:p_oSales>
                    </wsc:MasterSalesBlanket>
                  </soapenv:Body>
                </soapenv:Envelope>`,
            });

            const soapText = await parseStringPromise(soapRequest.data);
            const salesInfo =
              soapText["Soap:Envelope"]["Soap:Body"][0]["MasterSalesBlanket_Result"][0][
                "p_oSales"
              ][0]["PT_SalesInfo"][0];

            const lineInfos = salesInfo?.["LineInfo"] || [];
            const lineItems = lineInfos.map((lineInfo: { [x: string]: any[] }) => ({
              itemNo: lineInfo["ItemNo"][0],
              itemName: lineInfo["ItemName"][0],
              qty: parseInt(lineInfo["Qty"][0], 10),
              lineAmount: parseFloat(lineInfo["LineAmount"][0]),
              lineDiscount: parseFloat(lineInfo["LineDiscount"][0]),
              lineDiscountPc: parseFloat(lineInfo["LineDiscountPc"][0]),
              lineAmtAfterDiscount: parseFloat(lineInfo["LineAmtAfterDiscount"][0]),
              qtyToShip: parseInt(lineInfo["QtytoShip"][0], 10),
              qtyShipped: parseInt(lineInfo["QtytoShiped"][0], 10),
              madeToOrder: lineInfo["MadeToOrder"][0],
            }));

            let conutItem = 0;
            order.items.forEach((item) => {
              const matchingLineItem = lineItems.find(
                (lineItem: { itemNo: string; madeToOrder: any }) =>
                  lineItem.itemNo === item.product.code &&
                  Number(lineItem.madeToOrder) === item.amount
              );

              if (!matchingLineItem) {
                conutItem += 1;
              }
            });

            // ✅ Ensure the mapped function always resolves properly
            return { ...order, conutItem };
          } catch (error) {
            return { ...order, conutItem: 0 }; // Return with default value to avoid breaking the flow
          }
        })
      );
      const filteredOrders = newOrders.filter((order) => order.conutItem !== 0);
      return NextResponse.json({ orders: filteredOrders, total: filteredOrders.length });
    } else {
      return NextResponse.json({ orders, total });
    }
  } catch (error) {
    return NextResponse.json(error);
  } finally {
    await prisma.$disconnect();
  }
}