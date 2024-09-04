import { execSync } from 'child_process';
import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";
const prisma = new PrismaClient();
import { parseStringPromise } from 'xml2js';
import axios from 'axios';
import logger from '../../../logger';
import { PrismaClientInitializationError } from '@prisma/client/runtime/library';

// Function to format the date to YYYY-MM-DD
const formatDate = (date: any) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are zero-based
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// export async function GET(request: Request) {
//   logger.error('Fetch Invoice Data');
//   logger.error('Test log entry - checking logger setup');
//   logger.warn('Test warning log entry');
//   logger.error('Test error log entry');
//   try {
//     // Get today's date and format it
//     const today = new Date();
//     const formattedToday = formatDate(today);
//     logger.error('Fetch Invoice Data');
//     // Step 1: Fetch Invoice Data
//     const response = await axios({
//       method: 'get',
//       url: 'http://49.0.64.73:9147/BC200/WS/Comp%20Test/Codeunit/WSIntegration',
//       headers: {
//         'SOAPACTION': 'ReportSalesInvoiceDetail',
//         'Content-Type': 'application/xml',
//         'Authorization': 'Basic QURNMDFAY21jLmNvbTpDb21wbW90bzkq'
//       },
//       data: `<?xml version="1.0" encoding="UTF-8"?> 
//       <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" 
//       xmlns:wsc="urn:microsoft-dynamics-schemas/codeunit/WSIntegration"> 
//       <soapenv:Header/> 
//       <soapenv:Body> 
//           <wsc:ReportSalesInvoiceDetail> 
//               <wsc:p_gFromDate>2024-05-01</wsc:p_gFromDate> 
//               <wsc:p_gToDate>${formattedToday}</wsc:p_gToDate> 
//               <wsc:p_gFromCustNo></wsc:p_gFromCustNo> 
//               <wsc:p_gToCustNo></wsc:p_gToCustNo> 
//               <wsc:p_gBrand></wsc:p_gBrand> 
//               <wsc:p_gInvoiceNo></wsc:p_gInvoiceNo>
//               <wsc:p_oSales></wsc:p_oSales> 
//           </wsc:ReportSalesInvoiceDetail>        
//       </soapenv:Body> 
//       </soapenv:Envelope>`
//     });
//     logger.error('response', response);

//     // Parse the XML response
//     const result = await parseStringPromise(response.data);
//     const invoices = result['Soap:Envelope']['Soap:Body'][0]['ReportSalesInvoiceDetail_Result'][0]['p_oSales'][0]['PT_SalesInfo'];

//     // Step 2: Process Each Invoice
//     for (const invoice of invoices) {
//       const invoiceNo = invoice['InvoiceNo'][0];
//       const postingDate = new Date(invoice['PostingDate'][0]);
//       const totalAmountString = invoice['TotalAmount'][0].replace(/,/g, ''); // Remove commas
//       const totalAmount = parseFloat(totalAmountString); // Parse to float
//       const custNo = invoice['CustNo'][0];
//       let externalDocument = null;
//       invoice['ExternalDoc'] ? externalDocument = invoice['ExternalDoc'][0] : null

//       // Check if the invoice already exists
//       const existingInvoice = await prisma.invoice.findFirst({
//         where: { documentNo: invoiceNo }
//       });

//       if (!existingInvoice) {
//         // Step 3: Fetch Additional Invoice Details
//         const detailResponse = await axios({
//           method: 'get',
//           url: 'http://49.0.64.73:9147/BC200/WS/Comp%20Test/Codeunit/WSIntegration',
//           headers: {
//             'SOAPACTION': 'MasterSalesInvoice',
//             'Content-Type': 'application/xml',
//             'Authorization': 'Basic QURNMDFAY21jLmNvbTpDb21wbW90bzkq'
//           },
//           data: `<?xml version="1.0" encoding="UTF-8"?> 
//           <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" 
//           xmlns:wsc="urn:microsoft-dynamics-schemas/codeunit/WSIntegration"> 
//           <soapenv:Body> 
//               <wsc:MasterSalesInvoice> 
//                   <wsc:p_gInvoiceNo>${invoiceNo}</wsc:p_gInvoiceNo>          
//                   <wsc:p_oSales></wsc:p_oSales>
//               </wsc:MasterSalesInvoice>        
//           </soapenv:Body> 
//           </soapenv:Envelope>`
//         });

//         const detailResult = await parseStringPromise(detailResponse.data);
//         const salesInfo = detailResult['Soap:Envelope']['Soap:Body'][0]['MasterSalesInvoice_Result'][0]['p_oSales'][0]['PT_SalesInfo'][0];

//         // Find userId based on custNo
//         const user = await prisma.user.findFirst({
//           where: { custNo }
//         });

//         if (!user) {
//           logger.error(`User with customer number ${custNo} not found.`);
//           console.error(`User with customer number ${custNo} not found.`);
//           continue;
//         }

//         const userId = user.id;
//         logger.error(`userId ${userId} found.`);

//         // Step 4: Calculate Total Qty
//         const lineItems = salesInfo['LineInfo'];
//         let totalQty = 0;
//         let subTotal =0;
//         for (const item of lineItems) {
//           const qty = parseInt(item['Qty'][0], 10);
//           const lineAmount = parseInt(item['LineAmount'][0], 10);
//           totalQty += qty;
//           subTotal += lineAmount;
//         }

//         // Step 5: Save Invoice Data
//         const newInvoice = await prisma.invoice.create({
//           data: {
//             userId,
//             documentNo: invoiceNo,
//             date: postingDate,
//             totalPrice: totalAmount,
//             subTotal: subTotal,
//             totalAmount: totalQty,  // Add the calculated total quantity here
//             groupDiscount: user.custPriceGroup === '5STARS' ? 5 : 7,
//             externalDocument: externalDocument
//           }
//         });

//         // Step 6: Save Invoice Items
//         for (const item of lineItems) {
//           const itemNo = item['ItemNo'][0];
//           const qty = parseInt(item['Qty'][0], 10);
//           const lineAmount = parseFloat(item['LineAmount'][0]);
//           const lineDiscountPc = parseFloat(item['LineDiscountPc'][0]);
//           const discountPc = parseFloat(item['LineAmtAfterDiscount'][0]);

//           // Find productId based on itemNo (product code)
//           const product = await prisma.product.findUnique({
//             where: { code: itemNo }
//           });

//           if (!product) {
//             logger.error(`Product with item number ${itemNo} not found.`);
//             console.error(`Product with item number ${itemNo} not found.`);
//             continue;
//           }
//           logger.error(`Product with item number ${itemNo} found.`);

//           // Save the invoice item
//           const itemCreate = await prisma.invoiceItem.create({
//             data: {
//               invoiceId: newInvoice.id,
//               productId: product.id,
//               amount: qty,
//               price: (lineAmount/qty),
//               discount: lineDiscountPc,
//               discountPrice: discountPc
//             }
//           });
//           logger.error(`item created ${itemCreate}.`);
//         }
//       } else {
//         logger.error(`Invoice ${invoiceNo} already exists. Skipping.`);
//         console.log(`Invoice ${invoiceNo} already exists. Skipping.`);
//       }
//     }
//     return NextResponse.json("200");
//   } catch (error) {
//     return NextResponse.json(error);
//   }
// }

export async function GET(request: Request) {
  try {
    await prisma.$connect(); // Explicitly connect to the database
    const today = new Date();
    const formattedToday = formatDate(today);
    logger.error('Fetch Invoice Data');
    // Step 1: Fetch Invoice Data
    const response = await axios({
      method: 'get',
      url: 'http://49.0.64.73:9147/BC200/WS/Comp%20Test/Codeunit/WSIntegration',
      headers: {
        'SOAPACTION': 'ReportSalesInvoiceDetail',
        'Content-Type': 'application/xml',
        'Authorization': 'Basic QURNMDFAY21jLmNvbTpDb21wbW90bzkq'
      },
      data: `<?xml version="1.0" encoding="UTF-8"?> 
      <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" 
      xmlns:wsc="urn:microsoft-dynamics-schemas/codeunit/WSIntegration"> 
      <soapenv:Header/> 
      <soapenv:Body> 
          <wsc:ReportSalesInvoiceDetail> 
              <wsc:p_gFromDate>2024-05-01</wsc:p_gFromDate> 
              <wsc:p_gToDate>${formattedToday}</wsc:p_gToDate> 
              <wsc:p_gFromCustNo></wsc:p_gFromCustNo> 
              <wsc:p_gToCustNo></wsc:p_gToCustNo> 
              <wsc:p_gBrand></wsc:p_gBrand> 
              <wsc:p_gInvoiceNo></wsc:p_gInvoiceNo>
              <wsc:p_oSales></wsc:p_oSales> 
          </wsc:ReportSalesInvoiceDetail>        
      </soapenv:Body> 
      </soapenv:Envelope>`
    });
    logger.error('response', response);

    // Parse the XML response
    const result = await parseStringPromise(response.data);
    const invoices = result['Soap:Envelope']['Soap:Body'][0]['ReportSalesInvoiceDetail_Result'][0]['p_oSales'][0]['PT_SalesInfo'];

    // Step 2: Process Each Invoice
    for (const invoice of invoices) {
      const invoiceNo = invoice['InvoiceNo'][0];
      const postingDate = new Date(invoice['PostingDate'][0]);
      const totalAmountString = invoice['TotalAmount'][0].replace(/,/g, ''); // Remove commas
      const totalAmount = parseFloat(totalAmountString); // Parse to float
      const custNo = invoice['CustNo'][0];
      let externalDocument = null;
      invoice['ExternalDoc'] ? externalDocument = invoice['ExternalDoc'][0] : null

      // Check if the invoice already exists
      const existingInvoice = await prisma.invoice.findFirst({
        where: { documentNo: invoiceNo }
      });

      if (!existingInvoice) {
        // Step 3: Fetch Additional Invoice Details
        const detailResponse = await axios({
          method: 'get',
          url: 'http://49.0.64.73:9147/BC200/WS/Comp%20Test/Codeunit/WSIntegration',
          headers: {
            'SOAPACTION': 'MasterSalesInvoice',
            'Content-Type': 'application/xml',
            'Authorization': 'Basic QURNMDFAY21jLmNvbTpDb21wbW90bzkq'
          },
          data: `<?xml version="1.0" encoding="UTF-8"?> 
          <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" 
          xmlns:wsc="urn:microsoft-dynamics-schemas/codeunit/WSIntegration"> 
          <soapenv:Body> 
              <wsc:MasterSalesInvoice> 
                  <wsc:p_gInvoiceNo>${invoiceNo}</wsc:p_gInvoiceNo>          
                  <wsc:p_oSales></wsc:p_oSales>
              </wsc:MasterSalesInvoice>        
          </soapenv:Body> 
          </soapenv:Envelope>`
        });

        const detailResult = await parseStringPromise(detailResponse.data);
        const salesInfo = detailResult['Soap:Envelope']['Soap:Body'][0]['MasterSalesInvoice_Result'][0]['p_oSales'][0]['PT_SalesInfo'][0];

        // Find userId based on custNo
        const user = await prisma.user.findFirst({
          where: { custNo }
        });

        if (!user) {
          logger.error(`User with customer number ${custNo} not found.`);
          console.error(`User with customer number ${custNo} not found.`);
          continue;
        }

        const userId = user.id;
        logger.error(`userId ${userId} found.`);

        // Step 4: Calculate Total Qty
        const lineItems = salesInfo['LineInfo'];
        let totalQty = 0;
        let subTotal =0;
        for (const item of lineItems) {
          const qty = parseInt(item['Qty'][0], 10);
          const lineAmount = parseInt(item['LineAmount'][0], 10);
          totalQty += qty;
          subTotal += lineAmount;
        }

        // Step 5: Save Invoice Data
        const newInvoice = await prisma.invoice.create({
          data: {
            userId,
            documentNo: invoiceNo,
            date: postingDate,
            totalPrice: totalAmount,
            subTotal: subTotal,
            totalAmount: totalQty,  // Add the calculated total quantity here
            groupDiscount: user.custPriceGroup === '5STARS' ? 5 : 7,
            externalDocument: externalDocument
          }
        });

        // Step 6: Save Invoice Items
        for (const item of lineItems) {
          const itemNo = item['ItemNo'][0];
          const qty = parseInt(item['Qty'][0], 10);
          const lineAmount = parseFloat(item['LineAmount'][0]);
          const lineDiscountPc = parseFloat(item['LineDiscountPc'][0]);
          const discountPc = parseFloat(item['LineAmtAfterDiscount'][0]);

          // Find productId based on itemNo (product code)
          const product = await prisma.product.findUnique({
            where: { code: itemNo }
          });

          if (!product) {
            logger.error(`Product with item number ${itemNo} not found.`);
            console.error(`Product with item number ${itemNo} not found.`);
            continue;
          }
          logger.error(`Product with item number ${itemNo} found.`);

          // Save the invoice item
          const itemCreate = await prisma.invoiceItem.create({
            data: {
              invoiceId: newInvoice.id,
              productId: product.id,
              amount: qty,
              price: (lineAmount/qty),
              discount: lineDiscountPc,
              discountPrice: discountPc
            }
          });
          logger.error(`item created ${itemCreate}.`);
        }
      } else {
        logger.error(`Invoice ${invoiceNo} already exists. Skipping.`);
        console.log(`Invoice ${invoiceNo} already exists. Skipping.`);
      }
    }
  } catch (error: any) {
    console.error('Prisma Client Initialization Error:', error);
    if (error instanceof PrismaClientInitializationError) {
      console.error('Error details:', error.message, error.errorCode);
    }
    console.error('Error connecting to the database:', error);
    return NextResponse.json({ error: error.message });
  }
}