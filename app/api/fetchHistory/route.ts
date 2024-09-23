import { Prisma, PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";
const prisma = new PrismaClient();
import logger from "../../../logger";

export async function POST() {
  try {
    // Fetch all unchecked invoices
    const uncheckedInvoices = await prisma.invoice.findMany({
      where: { checked: false },
      include: {
        items: {
          include: {
            product: true,
          },
        },
        user: true,
      },
    });
    // Step 7: Check for active TotalPurchase and handle TotalPurchaseHistory
    const activeTotalPurchase = await prisma.totalPurchase.findFirst({
      where: { isActive: true },
      include: {
        items: true,
      },
    });
    // Step 8: Check for active SpecialBonus and handle SpecialBonusHistory
    const activeSpecialBonus = await prisma.specialBonus.findFirst({
      where: { isActive: true },
      include: {
        items: true, // Include related SpecialBonusItems
      },
    });
    for (const invoice of uncheckedInvoices) { 
      if (activeTotalPurchase) {
        const totalSpend = invoice.totalPrice;
        let existingTotalPurchaseHistory =
        await prisma.totalPurchaseHistory.findFirst({
          where: {
            userId: invoice.userId,
            totalPurchaseId: activeTotalPurchase.id,
          },
        });

        if (!existingTotalPurchaseHistory) {
          existingTotalPurchaseHistory = await prisma.totalPurchaseHistory.create({
            data: {
              userId: invoice.userId,
              totalPurchaseId: activeTotalPurchase.id,
              totalSpend: 0,
              level: 0,
              cn: 0,
              incentivePoint: 0,
              loyaltyPoint: 0,
            },
          });
        }
        const price = existingTotalPurchaseHistory
        ? existingTotalPurchaseHistory.totalSpend + totalSpend
        : totalSpend;
        
        const matchingItems = activeTotalPurchase.items.filter(
          (item: any) => price >= item.totalPurchaseAmount
        );
        const matchingItem =
        matchingItems.length > 0
          ? matchingItems.reduce((prev, curr) =>
              prev.order > curr.order ? prev : curr
            )
          : null;
          
        if (matchingItem) {
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
          logger.info(`invoiceNo : ${invoice.documentNo}.`);
          logger.info(`invoiceNo : ${invoice.totalPrice}.`);

          // Update the User model with the new points and cn
          await prisma.user.update({
            where: { id: invoice.userId },
            data: {
              cn: { increment: matchingItem.cn },
              rewardPoint: { increment: matchingItem.incentivePoint },
              loyaltyPoint: { increment: matchingItem.loyaltyPoint },
            },
          });
        }
      }

      if (activeSpecialBonus) {
        let  existingSpecialBonusHistory =
        await prisma.specialBonusHistory.findFirst({
          where: {
            userId: invoice.userId,
            specialBonusId: activeSpecialBonus.id,
          },
        });

        if (!existingSpecialBonusHistory) {
          existingSpecialBonusHistory = await prisma.specialBonusHistory.create({
            data: {
              userId: invoice.userId,
              specialBonusId: activeSpecialBonus.id,
              totalSpend: [], // Initialize empty spend data
              cn: 0,
              incentivePoint: 0,
            },
          });
        }

        let totalSpend = existingSpecialBonusHistory
        ? existingSpecialBonusHistory.totalSpend
        : [];
        if (Array.isArray(totalSpend)) { 
          for (const item of invoice.items) {
            const product = item.productId; // Assuming invoiceItem has product information
            const brandId = item.product.brandId;

            const matchingBonusItem = activeSpecialBonus.items.filter(
              (bonusItem) => bonusItem.brandId === brandId
            );
            if (matchingBonusItem) {
              // Find if the brandId already exists in totalSpend
              let brandTotalEntry = (totalSpend as Array<any>).find(
                (entry) => entry.brandId === brandId
              );
              const total = item.price;

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
                const matchingItems = matchingBonusItem.filter(
                  (item: any) => total >= item.totalPurchaseAmount
                ); // Filter all items where price is greater or equal
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

              // Update or create the SpecialBonusHistory record
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

              // Update the User model with reward points and cnBrand JSON
              const user = await prisma.user.findUnique({
                where: { id: invoice.userId },
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
                    where: { id: invoice.userId },
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
         // Mark the invoice as checked after processing
         await prisma.invoice.update({
          where: { id: invoice.id },
          data: {
            checked: true,
          },
        });
    }

    return NextResponse.json({ message: "Processing completed" });
  } catch (error) {
    console.error("Error processing invoices:", error);
    return NextResponse.json({ error: "Failed to process invoices" });
  } finally {
    await prisma.$disconnect();
  }
}
