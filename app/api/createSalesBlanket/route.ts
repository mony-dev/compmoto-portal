import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { decrypt } from '@lib-shared/utils/encryption';
import axios from 'axios';
const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  const { id, customerNo, orderItems } = await req.json();

  try {
    // Fetch the user from the database using Prisma
    const user = await prisma.user.findUnique({
      where: { id: Number(id) },
      include: { saleUser: true }, // Include the related saleUser
    });

    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    if (!user.saleUser || !user.saleUser?.encryptedPasswordtext) {
      return NextResponse.json({ message: 'Sale user not found' }, { status: 404 });
    }
   
    // Decrypt the password stored in the `encryptedPlaintext` column
    const decryptedPassword = decrypt(user.saleUser?.encryptedPasswordtext);
    // Use the decrypted password for your API call
    const authString = Buffer.from(`${user.saleUser.email}:${decryptedPassword}`).toString('base64');
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
                <ItemNo>${item.itemNo}</ItemNo>
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

    const response = await axios.post(
      'http://49.0.64.73:9147/BC200/WS/Comp%20Test/Codeunit/WSIntegration',
      soapRequest,
      {
        headers: {
          SOAPACTION: 'CreateSalesBlanket',
          'Content-Type': 'application/xml',
          Authorization: `Basic ${authString}`,
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
