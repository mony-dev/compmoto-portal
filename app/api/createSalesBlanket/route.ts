import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

export async function POST(req: NextRequest) {
  const { customerNo, externalDoc, createBy, orderItems } = await req.json();

  const soapRequest = `<?xml version="1.0" encoding="UTF-8"?>
<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:wsc="urn:microsoft-dynamics-schemas/codeunit/WSIntegration">
      <soapenv:Header/>
      <soapenv:Body>
        <wsc:CreateSalesBlanket>
          <wsc:p_oSales>
            <PT_SalesHdr>
              <CustomerNo>${customerNo}</CustomerNo>
              <PaymentMethod>TRANFER</PaymentMethod>
              ${orderItems
                .map(
                  (item: { itemNo: string; qty: number; unitPrice: number }) => `
              <PT_SalesLine>
                <ItemNo>31309</ItemNo>
                <Qty>${item.qty}</Qty>
                <UnitPrice>${item.unitPrice}</UnitPrice>
                <BlanketRemainQty>${item.qty}</BlanketRemainQty>    
              </PT_SalesLine>`
                )
                .join('')}
            </PT_SalesHdr>
          </wsc:p_oSales>
        </wsc:CreateSalesBlanket>
      </soapenv:Body>
    </soapenv:Envelope>`;

  try {
    const response = await axios.post(
      'http://49.0.64.73:9147/BC200/WS/Comp%20Test/Codeunit/WSIntegration',
      soapRequest,
      {
        headers: {
          SOAPACTION: 'CreateSalesBlanket',
          'Content-Type': 'application/xml',
          Authorization: 'Basic QURNMDFAY21jLmNvbTpDb21wbW90bzkq',
        },
      }
    );
    return NextResponse.json(response.data);
  } catch (error: any) {
    return NextResponse.json(
      { message: 'Failed to create BO', error: error.message },
      { status: 500 }
    );
  }
}
