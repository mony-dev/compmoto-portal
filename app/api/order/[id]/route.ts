import { NextResponse } from "next/server";
import { OrderType, PrismaClient } from "@prisma/client";
import axios from "axios";
import { parseStringPromise } from "xml2js";

const prisma = new PrismaClient();

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

export async function GET(
  request: Request,
  { params }: { params: { id: number } }
) {
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
              include: { imageProducts: true} ,
            }
          },
        },
      },
    });

    if (type === 'Normal') {
      return NextResponse.json(order);
    } else {

      if (!order) {
        return NextResponse.json({ error: "Order not found" }, { status: 404 });
      }
  
      const soapRequest = await axios({
        method: "get",
        url: "http://49.0.64.73:9147/BC200/WS/Comp%20Test/Codeunit/WSIntegration",
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
  
      const lineInfos = salesInfo["LineInfo"] || [];
  
      const lineItems = lineInfos.map((lineInfo: { [x: string]: string[] }) => ({
        itemNo: lineInfo["ItemNo"][0],
        itemName: lineInfo["ItemName"][0],
        qty: parseInt(lineInfo["Qty"][0], 10),
        lineAmount: parseFloat(lineInfo["LineAmount"][0]),
        lineDiscount: parseFloat(lineInfo["LineDiscount"][0]),
        lineDiscountPc: parseFloat(lineInfo["LineDiscountPc"][0]),
        lineAmtAfterDiscount: parseFloat(lineInfo["LineAmtAfterDiscount"][0]),
        qtyToShip: parseInt(lineInfo["QtytoShip"][0], 10),
        qtyShipped: parseInt(lineInfo["QtytoShiped"][0], 10),
        madeToOrder: lineInfo["MadeToOrder"][0], // Convert to boolean
      }));
  
      // Filter the items from the order and attach `madeToOrder` from SOAP response
      const filteredItems = order.items
        .map((orderItem) => {
          const matchingLineItem = lineItems.find(
            (lineItem: { itemNo: string; madeToOrder: number }) =>
              lineItem.itemNo === orderItem.product.code &&
              Number(lineItem.madeToOrder) === orderItem.amount
          );
          if (matchingLineItem) {
            return null; // Exclude the item
          }
  
          // Include the item and attach `madeToOrder`
          const correspondingLineItem = lineItems.find(
            (lineItem: { itemNo: string; }) => lineItem.itemNo === orderItem.product.code
          );
  
          return {
            ...orderItem,
            madeToOrder: correspondingLineItem
              ? parseInt(correspondingLineItem.madeToOrder)
              : 0, // Include madeToOrder from the matching SOAP line item
          };
        })
        .filter((item) => item !== null); // Remove excluded items
  
      // Construct a new order object with filtered items
      const filteredOrder = {
        ...order,
        items: filteredItems,
      };
  
      return NextResponse.json(filteredOrder);
    }
  } catch (error) {
    return NextResponse.json(error);
  } finally {
    await prisma.$disconnect();
  }
}
