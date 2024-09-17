import { execSync } from "child_process";
import { Prisma, PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";
const prisma = new PrismaClient();
import { parseStringPromise } from "xml2js";
import axios from "axios";
import logger from "../../../logger";
import { PrismaClientInitializationError } from "@prisma/client/runtime/library";

// Function to format the date to YYYY-MM-DD
const formatDate = (date: any) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0"); // Months are zero-based
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const page = 1;
  const pageSize = 50;

  try {
    const today = new Date();
    const formattedToday = formatDate(today);
    // Step 1: Fetch Invoice Data
    const response = await axios({
      method: "get",
      url: "http://49.0.64.73:9147/BC200/WS/Comp%20Test/Codeunit/WSIntegration",
      headers: {
        SOAPACTION: "ReportSalesInvoiceDetail",
        "Content-Type": "application/xml",
        Authorization: "Basic QURNMDFAY21jLmNvbTpDb21wbW90bzkq",
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
      </soapenv:Envelope>`,
    });
    // Parse the XML response
    const result = await parseStringPromise(response.data);
    const invoices =
      result["Soap:Envelope"]["Soap:Body"][0][
        "ReportSalesInvoiceDetail_Result"
      ][0]["p_oSales"][0]["PT_SalesInfo"];
    // Step 2: Process Each Invoice
    for (const invoice of invoices) {
      const invoiceNo = invoice["InvoiceNo"][0];
      const postingDate = new Date(invoice["PostingDate"][0]);
      const totalAmountString = invoice["TotalAmount"][0].replace(/,/g, ""); // Remove commas
      const totalAmount = parseFloat(totalAmountString); // Parse to float
      const custNo = invoice["CustNo"][0];
      let externalDocument = null;
      invoice["ExternalDoc"]
        ? (externalDocument = invoice["ExternalDoc"][0])
        : null;

      // Check if the invoice already exists
      const existingInvoice = await prisma.invoice.findFirst({
        where: { documentNo: invoiceNo },
      });

      if (!existingInvoice) {
        // Step 3: Fetch Additional Invoice Details
        const detailResponse = await axios({
          method: "get",
          url: "http://49.0.64.73:9147/BC200/WS/Comp%20Test/Codeunit/WSIntegration",
          headers: {
            SOAPACTION: "MasterSalesInvoice",
            "Content-Type": "application/xml",
            Authorization: "Basic QURNMDFAY21jLmNvbTpDb21wbW90bzkq",
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
          </soapenv:Envelope>`,
        });

        const detailResult = await parseStringPromise(detailResponse.data);
        const salesInfo =
          detailResult["Soap:Envelope"]["Soap:Body"][0][
            "MasterSalesInvoice_Result"
          ][0]["p_oSales"][0]["PT_SalesInfo"][0];

        // Find userId based on custNo
        const user = await prisma.user.findFirst({
          where: { custNo },
        });

        if (!user) {
          continue;
        }

        const userId = user.id;
        // Step 4: Calculate Total Qty
        const lineItems = salesInfo["LineInfo"];
        let totalQty = 0;
        let subTotal = 0;
        for (const item of lineItems) {
          const qty = parseInt(item["Qty"][0], 10);
          const lineAmount = parseInt(item["LineAmount"][0], 10);
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
            totalAmount: totalQty, // Add the calculated total quantity here
            groupDiscount: user.custPriceGroup === "5STARS" ? 5 : 7,
            externalDocument: externalDocument,
          },
        });

        // Step 6: Save Invoice Items
        for (const item of lineItems) {
          const itemNo = item["ItemNo"][0];
          const qty = parseInt(item["Qty"][0], 10);
          const lineAmount = parseFloat(item["LineAmount"][0]);
          const lineDiscountPc = parseFloat(item["LineDiscountPc"][0]);
          const discountPc = parseFloat(item["LineAmtAfterDiscount"][0]);

          // Find productId based on itemNo (product code)
          const product = await prisma.product.findUnique({
            where: { code: itemNo },
          });

          if (!product) {
            continue;
          }
          // Save the invoice item
          const itemCreate = await prisma.invoiceItem.create({
            data: {
              invoiceId: newInvoice.id,
              productId: product.id,
              amount: qty,
              price: lineAmount / qty,
              discount: lineDiscountPc,
              discountPrice: discountPc,
            },
          });
        }
        // Step 7: Check for active TotalPurchase and handle TotalPurchaseHistory
        const activeTotalPurchase = await prisma.totalPurchase.findFirst({
          where: { isActive: true },
          include: {
            items: true,
          },
        });

        if (activeTotalPurchase) {
          // Calculate totalSpend for the user
          const totalSpend = totalAmount; // totalAmount from your earlier calculation in Step 5
          const existingTotalPurchaseHistory =
            await prisma.totalPurchaseHistory.findFirst({
              where: {
                userId,
                totalPurchaseId: activeTotalPurchase.id,
              },
            });

          // Calculate new price for checking levels
          const price = existingTotalPurchaseHistory
            ? existingTotalPurchaseHistory.totalSpend + totalSpend
            : totalSpend;
          // Find the matching TotalPurchaseItem for the calculated price
          const matchingItems = activeTotalPurchase.items.filter(
            (item: any) => price >= item.totalPurchaseAmount
          ); // Filter all items where price is greater or equal

          // Get the item with the highest order
          const matchingItem =
            matchingItems.length > 0
              ? matchingItems.reduce((prev, curr) =>
                  prev.order > curr.order ? prev : curr
                )
              : null;

          if (matchingItem) {
            if (existingTotalPurchaseHistory) {
              // Update the existing TotalPurchaseHistory
              await prisma.totalPurchaseHistory.update({
                where: { id: existingTotalPurchaseHistory.id },
                data: {
                  totalSpend: price,
                  level: matchingItem.order,
                  cn: existingTotalPurchaseHistory.cn + matchingItem.cn,
                  incentivePoint:
                    existingTotalPurchaseHistory.incentivePoint +
                    matchingItem.incentivePoint,
                  loyaltyPoint:
                    existingTotalPurchaseHistory.loyaltyPoint +
                    matchingItem.loyaltyPoint,
                },
              });
            } else {
              // Create a new TotalPurchaseHistory
              await prisma.totalPurchaseHistory.create({
                data: {
                  userId,
                  totalPurchaseId: activeTotalPurchase.id,
                  totalSpend: totalSpend,
                  level: matchingItem.order,
                  cn: matchingItem.cn,
                  incentivePoint: matchingItem.incentivePoint,
                  loyaltyPoint: matchingItem.loyaltyPoint,
                },
              });
            }

            // Update the User model with the new points and cn
            await prisma.user.update({
              where: { id: userId },
              data: {
                cn: { increment: matchingItem.cn },
                rewardPoint: { increment: matchingItem.incentivePoint },
                loyaltyPoint: { increment: matchingItem.loyaltyPoint },
              },
            });
          }
        }

        // Step 8: Check for active SpecialBonus and handle SpecialBonusHistory
        const activeSpecialBonus = await prisma.specialBonus.findFirst({
          where: { isActive: true },
          include: {
            items: true, // Include related SpecialBonusItems
          },
        });
        logger.info(`activeSpecialBonus ${activeSpecialBonus}.`);

        if (activeSpecialBonus) {
          const existingSpecialBonusHistory =
            await prisma.specialBonusHistory.findFirst({
              where: {
                userId,
                specialBonusId: activeSpecialBonus.id,
              },
            });
          logger.info(
            `existingSpecialBonusHistory ${existingSpecialBonusHistory}.`
          );
          let totalSpend = existingSpecialBonusHistory
            ? existingSpecialBonusHistory.totalSpend
            : [];

          // Check if totalSpend is an array before continuing
          if (Array.isArray(totalSpend)) {
            const findNewInvoice = await prisma.invoice.findFirst({
              where: { id: newInvoice.id },
              include: {
                items: {
                  include: {
                    product: true,
                  },
                },
              },
            });
            if (findNewInvoice) {
              for (const invoice of findNewInvoice.items) {
                const invoiceItems = invoice; // Define invoiceItems properly

                const product = invoiceItems.productId; // Assuming invoiceItem has product information
                const brandId = invoiceItems.product.brandId;

                // Find the matching specialBonusItem for the product's brandId
                const matchingBonusItem = activeSpecialBonus.items.filter(
                  (bonusItem) => bonusItem.brandId === brandId
                );
                logger.info(`matchingBonusItem ${matchingBonusItem}.`);

                //        // Find the matching TotalPurchaseItem for the calculated price
                //     const total = invoiceItems.price; // Calculate total for the current product
                //     logger.info(`total ${total}.`);
                //   const matchingItems = matchingBonusItem.filter((item: any) => total >= item.totalPurchaseAmount); // Filter all items where price is greater or equal
                //   logger.info(`matchingItems ${matchingItems}.`);

                // // Get the item with the highest order
                // const matchingItem = matchingItems.length > 0
                //   ? matchingItems.reduce((prev, curr) => (prev.order > curr.order ? prev : curr))
                //   : null;
                //     logger.info(`matchingItem ${matchingItem}.`);

                if (matchingBonusItem) {
                  // Find if the brandId already exists in totalSpend
                  let brandTotalEntry = (totalSpend as Array<any>).find(
                    (entry) => entry.brandId === brandId
                  );
                  logger.info(`brandTotalEntry ${brandTotalEntry}.`);
                  const total = invoiceItems.price;

                  // Check if the brandId already exists in totalSpend JSON
                  let matchingItemCn = 0;
                  let matchingItemIncentivePoint = 0;

                  if (brandTotalEntry) {
                    // Update the existing total and level
                    brandTotalEntry.total += total;
                    const matchingItems = matchingBonusItem.filter(
                      (item: any) =>
                        brandTotalEntry.total >= item.totalPurchaseAmount
                    ); // Filter all items where price is greater or equal
                    logger.info(`matchingItems ${matchingItems}.`);

                    // Get the item with the highest order
                    const matchingItem =
                      matchingItems.length > 0
                        ? matchingItems.reduce((prev, curr) =>
                            prev.order > curr.order ? prev : curr
                          )
                        : null;
                    brandTotalEntry.level = matchingItem?.order;
                    matchingItemCn = matchingItem?.cn || 0;
                    matchingItemIncentivePoint =
                      matchingItem?.incentivePoint || 0;
                  } else {
                    // Add a new entry to totalSpend for this brandId
                    logger.info(`total ${total}.`);
                    const matchingItems = matchingBonusItem.filter(
                      (item: any) => total >= item.totalPurchaseAmount
                    ); // Filter all items where price is greater or equal
                    logger.info(`matchingItems ${matchingItems}.`);
                    logger.info(
                      `matchingItems.length ${matchingItems.length}.`
                    );

                    // Get the item with the highest order
                    const matchingItem =
                      matchingItems.length > 0
                        ? matchingItems.reduce((prev, curr) =>
                            prev.order > curr.order ? prev : curr
                          )
                        : null;
                    (totalSpend as Array<any>).push({
                      brandId: brandId,
                      total: total,
                      level: matchingItem?.order,
                    });
                    matchingItemCn = matchingItem?.cn || 0;
                    matchingItemIncentivePoint =
                      matchingItem?.incentivePoint || 0;
                  }
                  logger.info(`totalSpend ${totalSpend}.`);

                  // Update or create the SpecialBonusHistory record
                  if (existingSpecialBonusHistory) {
                    logger.info(
                      `existingSpecialBonusHistory ${existingSpecialBonusHistory}.`
                    );

                    await prisma.specialBonusHistory.update({
                      where: { id: existingSpecialBonusHistory.id },
                      data: {
                        totalSpend: totalSpend,
                        cn: existingSpecialBonusHistory.cn + matchingItemCn,
                        incentivePoint:
                          existingSpecialBonusHistory.incentivePoint +
                          matchingItemIncentivePoint,
                      },
                    });
                  } else {
                    logger.info(`create.`);

                    await prisma.specialBonusHistory.create({
                      data: {
                        userId,
                        specialBonusId: activeSpecialBonus.id,
                        totalSpend: totalSpend,
                        cn: matchingItemCn,
                        incentivePoint: matchingItemIncentivePoint,
                      },
                    });
                  }

                  // Update the User model with reward points and cnBrand JSON
                  const user = await prisma.user.findUnique({
                    where: { id: userId },
                  });
                  if (user) {
                    // Ensure cnBrand is an array and safely access it
                    let cnBrand = (user.cnBrand as Prisma.JsonArray) || [];

                    // Check if cnBrand is an array before using .find()
                    if (Array.isArray(cnBrand)) {
                      const brandCnEntry = (cnBrand as Array<any>).find(
                        (entry) => entry.brandId === brandId
                      );

                      if (brandCnEntry) {
                        // Update the existing cn for the brandId
                        brandCnEntry.cn += matchingItemCn;
                      } else {
                        // Add a new entry to cnBrand for this brandId
                        cnBrand.push({
                          brandId: brandId,
                          cn: matchingItemCn,
                        });
                      }

                      // Update user with new reward points and cnBrand
                      await prisma.user.update({
                        where: { id: userId },
                        data: {
                          rewardPoint: {
                            increment: matchingItemIncentivePoint,
                          },
                          cnBrand: cnBrand,
                        },
                      });
                    }
                  }
                }
              }
            }
          }
        }
      } else {
        logger.info(`Invoice ${invoiceNo} already exists. Skipping.`);
        console.log(`Invoice ${invoiceNo} already exists. Skipping.`);
      }
    }

    const [invoicesData, total] = await Promise.all([
      prisma.invoice.findMany({
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.invoice.count(),
    ]);

    return NextResponse.json({ data: invoicesData, total });
  } catch (error) {
    return NextResponse.json(error);
  } finally {
    await prisma.$disconnect();
  }
}
