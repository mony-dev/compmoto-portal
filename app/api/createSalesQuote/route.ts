import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

export async function POST(req: NextRequest) {
  const { customerNo, externalDoc, createBy, orderItems } = await req.json();
  const soapRequest = `<?xml version="1.0" encoding="UTF-8"?>
    <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:wsc="urn:microsoft-dynamics-schemas/codeunit/WSIntegration">
      <soapenv:Header/>
      <soapenv:Body>
        <wsc:CreateSalesQuote>
          <wsc:p_oSales>
            <PT_SalesHdr xmlns="urn:microsoft-dynamics-nav/xmlports/x50056">
              <CustomerNo>${customerNo}</CustomerNo>
              <PaymentMethod>TRANFER</PaymentMethod>
              <ExternalDoc>${externalDoc}</ExternalDoc>
              <CreateBy>${createBy}</CreateBy>
              ${orderItems
                .map(
                  (item: { itemNo: string, qty: number, year: number, unitPrice: number, lineDiscount: number, tyreDiscount: number }) => `
              <PT_SalesLine>
                <ItemNo>${item.itemNo}</ItemNo>
                <Qty>${item.qty}</Qty>
                <UnitPrice>${item.unitPrice}</UnitPrice>
                <LineDiscountP>${item.lineDiscount}</LineDiscountP>
                <LineTyreP>${item.tyreDiscount}</LineTyreP>
                <TyreYear>${item.year}</TyreYear>

              </PT_SalesLine>`
                )
                .join('')}
            </PT_SalesHdr>
          </wsc:p_oSales>
        </wsc:CreateSalesQuote>
      </soapenv:Body>
    </soapenv:Envelope>`;

  try {
    const response = await axios.post(
      'http://49.0.64.73:9147/BC200/WS/Comp%20Test/Codeunit/WSIntegration',
      soapRequest,
      {
        headers: {
          SOAPACTION: 'CreateSalesQuote',
          'Content-Type': 'application/xml',
          Authorization: 'Basic QURNMDFAY21jLmNvbTpDb21wbW90bzkq',
        },
      }
    );

    return NextResponse.json(response.data);
  } catch (error: any) {
    return NextResponse.json(
      { message: 'Failed to create sales quote', error: error.message },
      { status: 500 }
    );
  }
}
