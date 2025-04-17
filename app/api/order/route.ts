import { OrderType, PrismaClient } from "@prisma/client";
import axios from "axios";
import { NextResponse } from "next/server";
import { parseStringPromise } from "xml2js";
const prisma = new PrismaClient();

export async function POST(request: Request, { body }: { body: any }) {
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
        documentNo: 'test'
      },
    });
    const user = await prisma.user.findUnique({
      where: {
        id: Number(data.userId),
      }
    });
    const baseUrl = 'https://portal.comp-moto.com/th/admin/';
    const link = data.type === 'normal'
      ? `${baseUrl}normalOrder/${createOrder.id}`
      : `${baseUrl}backOrder/${createOrder.id}`;
    
    const message = `Web Portal : มีออเดอร์สั่งซื้อ จาก ${user?.custNo} \n ${link}`;
    
    const lineToken = process.env.LINE_ACCESS_TOKEN; 
    const lineUserId = process.env.LINE_USER_ID; 
    lineToken && lineUserId && await sendLineNotification(lineToken, message, lineUserId);

    return NextResponse.json(createOrder);
  } catch (error) {
    return NextResponse.json(error);
  } finally {
    await prisma.$disconnect();
  }
}

// async function sendLineNotification(token: any, message: any) {
//   const response = await fetch('https://notify-api.line.me/api/notify', {
//     method: 'POST',
//     headers: {
//       'Content-Type': 'application/x-www-form-urlencoded',
//       'Authorization': `Bearer ${token}`,
//     },
//     body: new URLSearchParams({ message }),
//   });

//   if (!response.ok) {
//     throw new Error('Failed to send LINE notification');
//   }
// }

async function sendLineNotification(token: string, message: string, userId: string) {
  const response = await fetch('https://api.line.me/v2/bot/message/push', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({
      to: userId, // LINE user ID
      messages: [
        {
          type: 'text',
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
// export async function GET(request: Request) {
//   const { searchParams } = new URL(request.url);
//   const q = searchParams.get('q') || '';
//   const type = searchParams.get('type') || '';
//   const userId = searchParams.get('userId') || '';
//   const page = parseInt(searchParams.get("page") || "1");
//   const pageSize = parseInt(searchParams.get("pageSize") || "30");

//   if (!userId) {
//       return NextResponse.json({ error: "User ID is required" }, { status: 400 });
//   }

//   // Define the start and end of the current year
//   const startOfYear = new Date(new Date().getFullYear(), 0, 1); // January 1st of this year
//   const endOfYear = new Date(new Date().getFullYear(), 11, 31, 23, 59, 59, 999); // December 31st of this year

//   try {
//     const [orders, total] = await Promise.all([
//       prisma.order.findMany({
//         where: {
//           userId: Number(userId),
//           type: type ? (type as OrderType) : undefined,
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
//           createdAt: 'desc',
//         },
//       }),
//       prisma.order.count({
//         where: {
//           userId: Number(userId),
//           type: type ? (type as OrderType) : undefined,
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
//         },
//       }),
//     ]);
   
//     if (type === 'Back') {
//       const newOrders = await Promise.all(
//         orders.map(async (order) => {
//           const soapRequest = await axios({
//             method: "get",
//             url: "http://49.0.64.73:9147/BC200/WS/Comp%20Test/Codeunit/WSIntegration",
//             headers: {
//               SOAPACTION: "MasterSalesBlanket",
//               "Content-Type": "application/xml",
//               Authorization: "Basic QURNMDFAY21jLmNvbTpDb21wbW90bzkq",
//             },
//             data: `<?xml version="1.0" encoding="UTF-8"?>
//               <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:wsc="urn:microsoft-dynamics-schemas/codeunit/WSIntegration">
//                 <soapenv:Header/>
//                 <soapenv:Body>
//                   <wsc:MasterSalesBlanket>
//                       <wsc:p_gBlanketNo>${order.documentNo}</wsc:p_gBlanketNo>
//                       <wsc:p_oSales></wsc:p_oSales>
//                   </wsc:MasterSalesBlanket>
//                 </soapenv:Body>
//               </soapenv:Envelope>`,
//           });
      
//           const soapText = await parseStringPromise(soapRequest.data);
      
//           const salesInfo =
//             soapText["Soap:Envelope"]["Soap:Body"][0]["MasterSalesBlanket_Result"][0][
//               "p_oSales"
//             ][0]["PT_SalesInfo"][0];
      
//           const lineInfos = salesInfo["LineInfo"] || [];
      
//           const lineItems = lineInfos.map((lineInfo: { [x: string]: any[]; }) => ({
//             itemNo: lineInfo["ItemNo"][0],
//             itemName: lineInfo["ItemName"][0],
//             qty: parseInt(lineInfo["Qty"][0], 10),
//             lineAmount: parseFloat(lineInfo["LineAmount"][0]),
//             lineDiscount: parseFloat(lineInfo["LineDiscount"][0]),
//             lineDiscountPc: parseFloat(lineInfo["LineDiscountPc"][0]),
//             lineAmtAfterDiscount: parseFloat(lineInfo["LineAmtAfterDiscount"][0]),
//             qtyToShip: parseInt(lineInfo["QtytoShip"][0], 10),
//             qtyShipped: parseInt(lineInfo["QtytoShiped"][0], 10),
//             madeToOrder: lineInfo["MadeToOrder"][0], // Convert to boolean
//           }));
      
//           let conutItem = 0;
//           order.items.forEach((item) => {
//             const matchingLineItem = lineItems.find(
//               (lineItem: { itemNo: string; madeToOrder: any; }) =>
//                 lineItem.itemNo === item.product.code &&
//                 Number(lineItem.madeToOrder) === item.amount
//             );
      
//             if (!matchingLineItem) {
//               conutItem += 1; // Increment count for non-matching items
//             }
//           });
      
//           // Attach conutItem to the order for filtering purposes
//           return { ...order, conutItem };
//         })
//       );
//       const filteredOrders = newOrders.filter((order) => order.conutItem !== 0);
//       return NextResponse.json({ orders: filteredOrders, total: filteredOrders.length });
//     } else {
//       return NextResponse.json({ orders: orders, total });
//     }
//   } catch (error) {
//     return NextResponse.json(error);
//   } finally {
//     await prisma.$disconnect();
//   }
// }

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q') || '';
  const type = searchParams.get('type') || '';
  const userId = searchParams.get('userId') || '';
  const page = parseInt(searchParams.get("page") || "1");
  const pageSize = parseInt(searchParams.get("pageSize") || "30");

  if (!userId) {
    return NextResponse.json({ error: "User ID is required" }, { status: 400 });
  }

  const startOfYear = new Date(new Date().getFullYear(), 0, 1);
  const endOfYear = new Date(new Date().getFullYear(), 11, 31, 23, 59, 59, 999);

  try {
    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where: {
          userId: Number(userId),
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
          createdAt: 'desc',
        },
      }),
      prisma.order.count({
        where: {
          userId: Number(userId),
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
    return NextResponse.json({ error: "Internal Server Error", details: error }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
