// import { PrismaClient } from '@prisma/client';
// const prisma = new PrismaClient();
// const saveHistory = async () => {
//     try {
//         // const start = new Date();
//         // const month = start.getUTCMonth() + 1; // Month as a number (1-12)
//         // const year = start.getUTCFullYear();
//         // // Step 7: Check for active TotalPurchase and handle TotalPurchaseHistory
//         // const activeTotalPurchase = await prisma.totalPurchase.findFirst({
//         //     where: { isActive: true },
//         //     include: {
//         //         items: true,
//         //     },
//         // });

//         // // Step 8: Check for active SpecialBonus and handle SpecialBonusHistory
//         // const activeSpecialBonus = await prisma.specialBonus.findFirst({
//         //     where: { isActive: true },
//         //     include: {
//         //         items: {
//         //             include: {
//         //                 minisize: {
//         //                     include: { brands: true }
//         //                 }
//         //             }
//         //         }, // Include related SpecialBonusItems
//         //     },
//         // });

//         // // Step 8.1: Check for current rewardPoint
//         // const currentRewardPoint = await prisma.rewardPoint.findFirst({
//         //     where: { month: month, year: year },
//         //     include: {
//         //         rewardPointHistories: true,
//         //     },
//         // });
//         // const activeMonth = activeTotalPurchase.month
//         let activeTotalPurchase = {}
//         let currentRewardPoint = {}
//         let activeSpecialBonus = {}


//         const uncheckedInvoices = await prisma.invoice.findMany({
//             where: {
//                 checked: false,
//             },
//             include: {
//                 items: {
//                     include: {
//                         product: true,
//                     },
//                 },
//                 user: {
//                     include: {
//                         customerGroup: true
//                     }
//                 },
//             },
//         });

//         let rewardPointHistoryObj = []

//         for (const invoice of uncheckedInvoices) {
//             activeTotalPurchase = await prisma.totalPurchase.findFirst({
//                 where: {
//                     isActive: true,
//                     customerGroupId: invoice.user.customerGroupId
//                 },
//                 include: {
//                     items: true,
//                 },
//             });
//             currentRewardPoint = await prisma.rewardPoint.findFirst({
//                 where: {
//                     isFinalize: true,
//                     customerGroupId: invoice.user.customerGroupId
//                 },
//                 include: {
//                     rewardPointHistories: true,
//                 },
//             });
//             if (activeTotalPurchase) {
//                 const totalSpend = invoice.totalPrice;
//                 // find existing TotalPurchaseHistory
//                 let existingTotalPurchaseHistory =
//                     await prisma.totalPurchaseHistory.findFirst({
//                         where: {
//                             userId: invoice.userId,
//                             totalPurchaseId: activeTotalPurchase.id,
//                         },
//                     });
//                 // find existing RewardPointHistory
//                 let existingRewardPointHistory =
//                     await prisma.rewardPointHistory.findFirst({
//                         where: {
//                             userId: invoice.userId,
//                             rewardPointId: currentRewardPoint.id,
//                         },
//                     });

//                 if (!existingTotalPurchaseHistory) {
//                     existingTotalPurchaseHistory = await prisma.totalPurchaseHistory.create({
//                         data: {
//                             userId: invoice.userId,
//                             totalPurchaseId: activeTotalPurchase.id,
//                             totalSpend: 0,
//                             level: 0,
//                             cn: 0,
//                             incentivePoint: 0,
//                             loyaltyPoint: 0,
//                         },
//                     });
//                 }
//                 if (!existingRewardPointHistory) {
//                     existingRewardPointHistory = await prisma.rewardPointHistory.create({
//                         data: {
//                             userId: invoice.userId,
//                             rewardPointId: currentRewardPoint.id,
//                             point: 0,
//                             incentivePoint: 0,
//                             loyaltyPoint: 0,
//                             totalPoint: 0,
//                             usedPoint: 0,
//                             totalSpend: 0
//                         },
//                     });
//                 }
//                 const price = totalSpend;

//                 const matchingItems = activeTotalPurchase.items.filter(
//                     (item) => price >= item.totalPurchaseAmount
//                 );

//                 const matchingItem =
//                     matchingItems.length > 0
//                         ? matchingItems.reduce((prev, curr) =>
//                             prev.order > curr.order ? prev : curr
//                         )
//                         : { order: 0, cn: 0, incentivePoint: 0, loyaltyPoint: 0 };

//                 if (matchingItem) {
//                     const calIncentivePoint = matchingItem.incentivePoint
//                     const calLoyaltyPoint = matchingItem.loyaltyPoint
//                     const calTotalPoint = (calIncentivePoint + calLoyaltyPoint)
//                     const newRewardHistory = {
//                         userId: invoice.userId,
//                         rewardPointId: currentRewardPoint.id,
//                         point: 0,
//                         incentivePoint: calIncentivePoint,
//                         loyaltyPoint: calLoyaltyPoint,
//                         totalPoint: calTotalPoint,
//                         totalSpend: price
//                     }
//                     rewardPointHistoryObj.push(newRewardHistory);
//                     // Update totalPurchaseHistory
//                     await prisma.totalPurchaseHistory.update({
//                         where: { id: existingTotalPurchaseHistory.id },
//                         data: {
//                             totalSpend: existingTotalPurchaseHistory.totalSpend + price,
//                             level: matchingItem.order,
//                             cn: existingTotalPurchaseHistory.cn + matchingItem.cn,
//                             incentivePoint:
//                                 existingTotalPurchaseHistory.incentivePoint + matchingItem.incentivePoint,
//                             loyaltyPoint:
//                                 existingTotalPurchaseHistory.loyaltyPoint + matchingItem.loyaltyPoint,
//                         },
//                     });
//                     // Update the User model with the new cn
//                     await prisma.user.update({
//                         where: { id: invoice.userId },
//                         data: {
//                             cn: { increment: matchingItem.cn },
//                         },
//                     });
//                 }
//             }

//             activeSpecialBonus = await prisma.specialBonus.findFirst({
//                 where: {
//                     isActive: true,
//                     customerGroupId: invoice.user.customerGroupId
//                 },
//                 include: {
//                     items: {
//                         include: {
//                             minisize: {
//                                 include: { brands: true }
//                             }
//                         }
//                     }, // Include related SpecialBonusItems
//                 },
//             });

//             if (activeSpecialBonus) {
//                 let existingSpecialBonusHistory =
//                     await prisma.specialBonusHistory.findFirst({
//                         where: {
//                             userId: invoice.userId,
//                             specialBonusId: activeSpecialBonus.id,
//                         }
//                     });
//                 // find existing RewardPointHistory
//                 let existingRewardPointHistory =
//                     await prisma.rewardPointHistory.findFirst({
//                         where: {
//                             userId: invoice.userId,
//                             rewardPointId: currentRewardPoint.id,
//                         },
//                     });

//                 if (!existingSpecialBonusHistory) {
//                     existingSpecialBonusHistory = await prisma.specialBonusHistory.create({
//                         data: {
//                             userId: invoice.userId,
//                             specialBonusId: activeSpecialBonus.id,
//                             totalSpend: [], // Initialize empty spend data
//                             cn: 0,
//                             incentivePoint: 0,
//                         },
//                     });
//                 }
//                 if (!existingRewardPointHistory) {
//                     existingRewardPointHistory = await prisma.rewardPointHistory.create({
//                         data: {
//                             userId: invoice.userId,
//                             rewardPointId: currentRewardPoint.id,
//                             point: 0,
//                             incentivePoint: 0,
//                             loyaltyPoint: 0,
//                             totalPoint: 0,
//                             usedPoint: 0,
//                             totalSpend: 0
//                         },
//                     });
//                 }

//                 let totalSpend = existingSpecialBonusHistory
//                     ? existingSpecialBonusHistory.totalSpend
//                     : [];
//                 if (Array.isArray(totalSpend)) {
//                     for (const item of invoice.items) {
//                         const brandId = item.product.brandId;
//                         let brandIds = []
//                         const matchingBonusItem = activeSpecialBonus.items.filter((bonusItem) =>
//                             bonusItem.minisize.brands.some((brand) => brand.brandId === brandId)
//                         );
//                         if (matchingBonusItem.length > 0) {
//                             // Find if the brandId already exists in totalSpend
//                             let brandTotalEntry = (totalSpend).find(
//                                 (entry) => entry.brandId === brandId
//                             );
//                             const total = item.discountPrice;

//                             // Check if the brandId already exists in totalSpend JSON
//                             let matchingItemCn = 0;
//                             let matchingItemIncentivePoint = 0;

//                             if (brandTotalEntry) {
//                                 // Update the existing total and level
//                                 brandTotalEntry.total += total;
//                                 const matchingItems = matchingBonusItem.filter(
//                                     (item) =>
//                                         brandTotalEntry.total >= item.totalPurchaseAmount
//                                 ); // Filter all items where price is greater or equal
//                                 // Get the item with the highest order
//                                 const matchingItem =
//                                     matchingItems.length > 0
//                                         ? matchingItems.reduce((prev, curr) =>
//                                             prev.order > curr.order ? prev : curr
//                                         )
//                                         : null;
//                                 brandTotalEntry.level = matchingItem?.order;
//                                 matchingItemCn = matchingItem?.cn || 0;
//                                 matchingItemIncentivePoint =
//                                     matchingItem?.incentivePoint || 0;
//                             } else {
//                                 // Add a new entry to totalSpend for this brandId
//                                 const matchingItems = matchingBonusItem.filter(
//                                     (item) => total >= item.totalPurchaseAmount
//                                 ); // Filter all items where price is greater or equal
//                                 // Get the item with the highest order
//                                 const matchingItem =
//                                     matchingItems.length > 0
//                                         ? matchingItems.reduce((prev, curr) =>
//                                             prev.order > curr.order ? prev : curr
//                                         )
//                                         : null;
//                                 (totalSpend).push({
//                                     brandId: brandId,
//                                     total: total,
//                                     level: matchingItem?.order,
//                                 });
//                                 matchingItemCn = matchingItem?.cn || 0;
//                                 matchingItemIncentivePoint =
//                                     matchingItem?.incentivePoint || 0;
//                             }
//                             // Group totalSpend by minisize
//                             const minisizeGroups = groupByMinisize(activeSpecialBonus.items, totalSpend);

//                             // Update the levels for the grouped minisizes
//                             await updateLevelsForMinisizes(minisizeGroups, activeSpecialBonus, totalSpend);

//                             // Update or create the SpecialBonusHistory record
//                             await prisma.specialBonusHistory.update({
//                                 where: { id: existingSpecialBonusHistory.id },
//                                 data: {
//                                     totalSpend: totalSpend,
//                                     cn: matchingItemCn,
//                                     incentivePoint:
//                                         matchingItemIncentivePoint,
//                                 },
//                             });
//                             const calIncentivePointBonus = matchingItemIncentivePoint
//                             const newRewardHistoryBonus = {
//                                 userId: invoice.userId,
//                                 rewardPointId: currentRewardPoint.id,
//                                 point: 0,
//                                 incentivePoint: calIncentivePointBonus,
//                                 loyaltyPoint: 0,
//                                 totalPoint: calIncentivePointBonus,
//                                 totalSpend: 0
//                             }
//                             rewardPointHistoryObj.push(newRewardHistoryBonus);
//                             // Update the User model with reward points and cnBrand JSON
//                             const user = await prisma.user.findUnique({
//                                 where: { id: invoice.userId },
//                             });
//                             if (user) {
//                                 // Ensure cnBrand is an array and safely access it
//                                 let cnBrand = (user.cnBrand) || [];

//                                 // Check if cnBrand is an array before using .find()
//                                 if (Array.isArray(cnBrand)) {
//                                     const brandCnEntry = (cnBrand).find(
//                                         (entry) => entry.brandId === brandId
//                                     );

//                                     if (brandCnEntry) {
//                                         // Update the existing cn for the brandId
//                                         brandCnEntry.cn = matchingItemCn;
//                                     } else {
//                                         // Add a new entry to cnBrand for this brandId
//                                         cnBrand.push({
//                                             brandId: brandId,
//                                             cn: matchingItemCn,
//                                         });
//                                     }

//                                     // Update user with new reward points and cnBrand
//                                     await prisma.user.update({
//                                         where: { id: invoice.userId },
//                                         data: {
//                                             cnBrand: cnBrand,
//                                         },
//                                     });
//                                 }
//                             }
//                         }
//                     }
//                 }
//             }
//             // Mark the invoice as checked after processing
//             await prisma.invoice.update({
//                 where: { id: invoice.id },
//                 data: {
//                     checked: true,
//                 },
//             });
//         }

//         // const mergedHistoryObj = Object.values(
//         //     rewardPointHistoryObj.reduce((acc, curr) => {
//         //         const key = `${curr.userId}-${curr.rewardPointId}`;

//         //         if (!acc[key]) {
//         //             acc[key] = { ...curr };
//         //         } else {
//         //             acc[key].incentivePoint += curr.incentivePoint;
//         //             acc[key].loyaltyPoint += curr.loyaltyPoint;
//         //             acc[key].totalPoint += curr.totalPoint;
//         //             acc[key].totalSpend += curr.totalSpend;
//         //         }

//         //         return acc;
//         //     }, {})
//         // );

//         // Step 1: remove exact duplicates
//         const unique = rewardPointHistoryObj.filter(
//             (item, index, self) =>
//                 index === self.findIndex((t) =>
//                     t.userId === item.userId &&
//                     t.rewardPointId === item.rewardPointId &&
//                     t.point === item.point &&
//                     t.incentivePoint === item.incentivePoint &&
//                     t.loyaltyPoint === item.loyaltyPoint &&
//                     t.totalPoint === item.totalPoint &&
//                     t.totalSpend === item.totalSpend
//                 )
//         );

//         // Step 2: merge by userId + rewardPointId
//         const mergedHistoryObj = Object.values(
//             unique.reduce((acc, curr) => {
//                 const key = `${curr.userId}-${curr.rewardPointId}`;
//                 if (!acc[key]) {
//                     acc[key] = { ...curr };
//                 } else {
//                     acc[key].incentivePoint += curr.incentivePoint;
//                     acc[key].loyaltyPoint += curr.loyaltyPoint;
//                     acc[key].totalPoint += curr.totalPoint;
//                     acc[key].totalSpend += curr.totalSpend;
//                 }
//                 return acc;
//             }, {})
//         );

//         for (const mergedItem of mergedHistoryObj) {
//             let existing =
//                 await prisma.rewardPointHistory.findFirst({
//                     where: {
//                         userId: mergedItem.userId,
//                         rewardPointId: mergedItem.rewardPointId,
//                     },
//                 });
//             let existingHistory =
//                 await prisma.totalPurchaseHistory.findFirst({
//                     where: {
//                         userId: mergedItem.userId,
//                         totalPurchaseId: activeTotalPurchase.id,
//                     },
//                 });

//             if (existing && existingHistory) {
//                 const point = (((existingHistory.totalSpend) * currentRewardPoint.point) / currentRewardPoint.expenses)

//                 await prisma.rewardPointHistory.update({
//                     where: { id: existing.id },
//                     data: {
//                         point: point,
//                         incentivePoint: existing.incentivePoint + mergedItem.incentivePoint,
//                         loyaltyPoint: existing.loyaltyPoint + mergedItem.loyaltyPoint,
//                         totalPoint: existing.totalPoint + mergedItem.totalPoint + point,
//                         totalSpend: existingHistory.totalSpend
//                     },
//                 });

//                 const matchingItems = activeTotalPurchase.items.filter(
//                     (item) => existingHistory.totalSpend >= item.totalPurchaseAmount
//                 );

//                 if (matchingItems) {
//                     const lastItem = matchingItems[matchingItems.length - 1];
//                     await prisma.totalPurchaseHistory.update({
//                         where: { id: existingHistory.id },
//                         data: {
//                             level: lastItem.order,
//                             cn: lastItem.cn,
//                             incentivePoint:
//                                 lastItem.incentivePoint,
//                             loyaltyPoint:
//                                 lastItem.loyaltyPoint,
//                         },
//                     });
//                 }
//             }

//             //if this invoice in the pass book
//             // if (currentRewardPoint.isFinalize) {
//             //     const pointAfter = Math.floor(((mergedItem.totalSpend) * currentRewardPoint.point) / currentRewardPoint.expenses)
//             //     const user = await prisma.user.findFirst({
//             //         where: {
//             //             id: mergedItem.userId
//             //         },
//             //     });
//             //     const update = await prisma.user.update({
//             //         where: {
//             //             id: mergedItem.userId,
//             //         },
//             //         data: {
//             //             rewardPoint: user.rewardPoint + pointAfter + mergedItem.incentivePoint + mergedItem.loyaltyPoint,
//             //         },
//             //     });
//             // }
//         }

//     } catch (error) {
//         console.error('An error occurred:', error);
//     }
// };

// const groupByMinisize = (items, totalSpend) => {
//     const minisizeGroups = {};

//     for (const spend of totalSpend) {
//         const { brandId, total } = spend;

//         // Find matching bonus items for this brandId
//         const matchingBonusItems = items.filter((bonusItem) =>
//             bonusItem.minisize.brands.some((brand) => brand.brandId === brandId)
//         );

//         // Group by minisize
//         for (const bonusItem of matchingBonusItems) {
//             const minisizeId = bonusItem.minisize.id;

//             // Initialize group if not already present
//             if (!minisizeGroups[minisizeId]) {
//                 minisizeGroups[minisizeId] = [];
//             }

//             // Check if the brandId already exists in this minisize group
//             const existingBrand = minisizeGroups[minisizeId].find(
//                 (entry) => entry.brandId === brandId
//             );

//             // If the brandId doesn't exist, add it
//             if (!existingBrand) {
//                 minisizeGroups[minisizeId].push({ brandId, total });
//             } else {
//                 // If the brandId already exists, update the total (e.g., sum up the total)
//                 existingBrand.total;
//             }
//         }
//     }

//     return minisizeGroups;
// };

// const updateLevelsForMinisizes = async (minisizeGroups, activeSpecialBonus, totalSpend) => {
//     for (const minisizeId in minisizeGroups) {
//         const group = minisizeGroups[minisizeId];

//         // Sum the total for this minisize group
//         const totalGroupSpend = group.reduce((sum, item) => sum + item.total, 0);

//         // Find the matching bonus items for this minisize
//         const matchingBonusItems = activeSpecialBonus.items.filter(
//             (item) => item.minisize.id === parseInt(minisizeId)
//         );

//         // Find the matching item where totalGroupSpend >= totalPurchaseAmount
//         const matchingItem = matchingBonusItems
//             .filter((item) => totalGroupSpend >= item.totalPurchaseAmount)
//             .reduce((prev, curr) => {
//                 // Ensure prev is not null and check both prev.order and curr.order safely
//                 if (!prev || !prev.order) return curr;
//                 return (prev.order > curr.order ? prev : curr);
//             }, null);

//         if (matchingItem) {
//             // Update the level for all brandIds in this group
//             for (const spendItem of group) {
//                 const { brandId } = spendItem;

//                 // Update the level for this brandId in totalSpend
//                 const spendEntry = totalSpend.find(
//                     (entry) => entry.brandId === brandId
//                 );

//                 if (spendEntry) {
//                     spendEntry.level = matchingItem.order;
//                 }
//             }
//         }

//     }
// };


// saveHistory().catch(console.error);
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const toNumber = (value) => Number(value || 0);

const getCumulativeTotalPurchaseReward = (items, spend) => {
  const matched = items
    .filter((item) => spend >= item.totalPurchaseAmount)
    .sort((a, b) => a.order - b.order);

  return {
    level: matched.length ? matched[matched.length - 1].order : 0,
    cn: matched.reduce((sum, item) => sum + toNumber(item.cn), 0),
    incentivePoint: matched.reduce(
      (sum, item) => sum + toNumber(item.incentivePoint),
      0
    ),
    loyaltyPoint: matched.reduce(
      (sum, item) => sum + toNumber(item.loyaltyPoint),
      0
    ),
  };
};

const getCumulativeSpecialBonusReward = (items, spend) => {
  const matched = items
    .filter((item) => spend >= item.totalPurchaseAmount)
    .sort((a, b) => a.order - b.order);

  return {
    level: matched.length ? matched[matched.length - 1].order : 0,
    cn: matched.reduce((sum, item) => sum + toNumber(item.cn), 0),
    incentivePoint: matched.reduce(
      (sum, item) => sum + toNumber(item.incentivePoint),
      0
    ),
  };
};

const groupByMinisize = (items, totalSpend) => {
  const minisizeGroups = {};

  for (const spend of totalSpend) {
    const brandId = Number(spend.brandId);
    const total = Number(spend.total || 0);

    const matchingBonusItems = items.filter((bonusItem) =>
      bonusItem.minisize.brands.some(
        (brand) => Number(brand.brandId) === brandId
      )
    );

    for (const bonusItem of matchingBonusItems) {
      const minisizeId = Number(bonusItem.minisize.id);

      if (!minisizeGroups[minisizeId]) {
        minisizeGroups[minisizeId] = [];
      }

      const existingBrand = minisizeGroups[minisizeId].find(
        (entry) => Number(entry.brandId) === brandId
      );

      if (!existingBrand) {
        minisizeGroups[minisizeId].push({
          brandId,
          total,
          level: Number(spend.level || 0),
        });
      } else {
        existingBrand.total = total;
      }
    }
  }

  return minisizeGroups;
};

const upsertRewardPointHistoryDelta = (rewardPointHistoryObj, input) => {
  if (
    input.point === 0 &&
    input.incentivePoint === 0 &&
    input.loyaltyPoint === 0 &&
    input.totalPoint === 0 &&
    input.totalSpend === 0
  ) {
    return;
  }

  rewardPointHistoryObj.push(input);
};

const normalizeSpendEntries = (value) => {
  if (!Array.isArray(value)) return [];

  return value.map((entry) => ({
    brandId: Number(entry.brandId),
    total: Number(entry.total || 0),
    level: Number(entry.level || 0),
  }));
};

const saveHistory = async () => {
  try {
    const uncheckedInvoices = await prisma.invoice.findMany({
      where: {
        checked: false,
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
        user: {
          include: {
            customerGroup: true,
          },
        },
      },
      orderBy: {
        id: "asc",
      },
    });

    const rewardPointHistoryObj = [];

    for (const invoice of uncheckedInvoices) {
      await prisma.$transaction(async (tx) => {
        const customerGroupId = invoice.user.customerGroupId;

        const activeTotalPurchase = await tx.totalPurchase.findFirst({
          where: {
            isActive: true,
            customerGroupId,
          },
          include: {
            items: true,
          },
        });

        const activeSpecialBonus = await tx.specialBonus.findFirst({
          where: {
            isActive: true,
            customerGroupId,
          },
          include: {
            items: {
              include: {
                minisize: {
                  include: {
                    brands: true,
                  },
                },
              },
            },
          },
        });

        const currentRewardPoint = await tx.rewardPoint.findFirst({
          where: {
            isFinalize: true,
            customerGroupId,
          },
          include: {
            rewardPointHistories: true,
          },
        });

        let totalPurchaseHistory = null;
        let specialBonusHistory = null;
        let rewardPointHistory = null;

        if (activeTotalPurchase) {
          totalPurchaseHistory = await tx.totalPurchaseHistory.findUnique({
            where: {
              userId_totalPurchaseId: {
                userId: invoice.userId,
                totalPurchaseId: activeTotalPurchase.id,
              },
            },
          });

          if (!totalPurchaseHistory) {
            totalPurchaseHistory = await tx.totalPurchaseHistory.create({
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
        }

        if (activeSpecialBonus) {
          specialBonusHistory = await tx.specialBonusHistory.findUnique({
            where: {
              userId_specialBonusId: {
                userId: invoice.userId,
                specialBonusId: activeSpecialBonus.id,
              },
            },
          });

          if (!specialBonusHistory) {
            specialBonusHistory = await tx.specialBonusHistory.create({
              data: {
                userId: invoice.userId,
                specialBonusId: activeSpecialBonus.id,
                totalSpend: [],
                cn: 0,
                incentivePoint: 0,
              },
            });
          }
        }

        if (currentRewardPoint) {
          rewardPointHistory = await tx.rewardPointHistory.findUnique({
            where: {
              userId_rewardPointId: {
                userId: invoice.userId,
                rewardPointId: currentRewardPoint.id,
              },
            },
          });

          if (!rewardPointHistory) {
            rewardPointHistory = await tx.rewardPointHistory.create({
              data: {
                userId: invoice.userId,
                rewardPointId: currentRewardPoint.id,
                point: 0,
                incentivePoint: 0,
                loyaltyPoint: 0,
                totalPoint: 0,
                usedPoint: 0,
                totalSpend: 0,
              },
            });
          }
        }

        // -----------------------------
        // 1) TOTAL PURCHASE HISTORY
        // -----------------------------
        if (activeTotalPurchase && totalPurchaseHistory) {
          const invoiceSpend = toNumber(invoice.totalPrice);
          const newTotalSpend =
            toNumber(totalPurchaseHistory.totalSpend) + invoiceSpend;

          const totalPurchaseReward = getCumulativeTotalPurchaseReward(
            activeTotalPurchase.items,
            newTotalSpend
          );

          const prevCn = toNumber(totalPurchaseHistory.cn);
          const prevIncentive = toNumber(totalPurchaseHistory.incentivePoint);
          const prevLoyalty = toNumber(totalPurchaseHistory.loyaltyPoint);

          const diffCn = totalPurchaseReward.cn - prevCn;
          const diffIncentive =
            totalPurchaseReward.incentivePoint - prevIncentive;
          const diffLoyalty =
            totalPurchaseReward.loyaltyPoint - prevLoyalty;

          await tx.totalPurchaseHistory.update({
            where: { id: totalPurchaseHistory.id },
            data: {
              totalSpend: newTotalSpend,
              level: totalPurchaseReward.level,
              cn: totalPurchaseReward.cn,
              incentivePoint: totalPurchaseReward.incentivePoint,
              loyaltyPoint: totalPurchaseReward.loyaltyPoint,
            },
          });

          if (diffCn > 0) {
            await tx.user.update({
              where: { id: invoice.userId },
              data: {
                cn: {
                  increment: diffCn,
                },
              },
            });
          }

          if (currentRewardPoint) {
            upsertRewardPointHistoryDelta(rewardPointHistoryObj, {
              userId: invoice.userId,
              rewardPointId: currentRewardPoint.id,
              point: 0,
              incentivePoint: diffIncentive > 0 ? diffIncentive : 0,
              loyaltyPoint: diffLoyalty > 0 ? diffLoyalty : 0,
              totalPoint:
                (diffIncentive > 0 ? diffIncentive : 0) +
                (diffLoyalty > 0 ? diffLoyalty : 0),
              totalSpend: 0,
            });
          }
        }

        // -----------------------------
        // 2) SPECIAL BONUS HISTORY
        // -----------------------------
        // -----------------------------
        // 2) SPECIAL BONUS HISTORY
        // -----------------------------
        if (activeSpecialBonus && specialBonusHistory) {
          let totalSpend = normalizeSpendEntries(specialBonusHistory.totalSpend);

          // เก็บ brand ที่อยู่ใน special bonus config จริง
          const eligibleBrandIds = new Set();

          for (const bonusItem of activeSpecialBonus.items) {
            for (const brand of bonusItem.minisize.brands) {
              eligibleBrandIds.add(Number(brand.brandId));
            }
          }

          // update / add spend by brand
          for (const item of invoice.items) {
            const brandId = Number(item.product.brandId);

            // ถ้า brand นี้ไม่ได้อยู่ใน special bonus config ให้ข้าม
            if (!eligibleBrandIds.has(brandId)) continue;

            const amount = toNumber(item.discountPrice);

            const existingBrandEntry = totalSpend.find(
              (entry) => Number(entry.brandId) === brandId
            );

            if (existingBrandEntry) {
              existingBrandEntry.total += amount;
            } else {
              totalSpend.push({
                brandId,
                total: amount,
                level: 0,
              });
            }
          }

          const minisizeGroups = groupByMinisize(
            activeSpecialBonus.items,
            totalSpend
          );

          let totalSpecialCn = 0;
          let totalSpecialIncentive = 0;

          for (const minisizeIdStr of Object.keys(minisizeGroups)) {
            const minisizeId = Number(minisizeIdStr);
            const group = minisizeGroups[minisizeId];

            const totalGroupSpend = group.reduce(
              (sum, entry) => sum + toNumber(entry.total),
              0
            );

            const matchingBonusItems = activeSpecialBonus.items.filter(
              (bonusItem) => Number(bonusItem.minisize.id) === minisizeId
            );

            const specialReward = getCumulativeSpecialBonusReward(
              matchingBonusItems,
              totalGroupSpend
            );

            totalSpecialCn += specialReward.cn;
            totalSpecialIncentive += specialReward.incentivePoint;

            // update level กลับไปที่ totalSpend ของทุก brand ใน minisize group นี้
            for (const spendItem of group) {
              const spendEntry = totalSpend.find(
                (entry) => Number(entry.brandId) === Number(spendItem.brandId)
              );

              if (spendEntry) {
                spendEntry.level = specialReward.level;
              }
            }
          }

          const prevSpecialCn = toNumber(specialBonusHistory.cn);
          const prevSpecialIncentive = toNumber(
            specialBonusHistory.incentivePoint
          );

          const diffSpecialCn = totalSpecialCn - prevSpecialCn;
          const diffSpecialIncentive =
            totalSpecialIncentive - prevSpecialIncentive;

          await tx.specialBonusHistory.update({
            where: { id: specialBonusHistory.id },
            data: {
              totalSpend,
              cn: totalSpecialCn,
              incentivePoint: totalSpecialIncentive,
            },
          });

          if (currentRewardPoint) {
            upsertRewardPointHistoryDelta(rewardPointHistoryObj, {
              userId: invoice.userId,
              rewardPointId: currentRewardPoint.id,
              point: 0,
              incentivePoint: diffSpecialIncentive > 0 ? diffSpecialIncentive : 0,
              loyaltyPoint: 0,
              totalPoint: diffSpecialIncentive > 0 ? diffSpecialIncentive : 0,
              totalSpend: 0,
            });
          }

          const user = await tx.user.findUnique({
            where: { id: invoice.userId },
          });

          if (user) {
            let cnBrand = Array.isArray(user.cnBrand) ? [...user.cnBrand] : [];

            for (const minisizeIdStr of Object.keys(minisizeGroups)) {
              const minisizeId = Number(minisizeIdStr);
              const group = minisizeGroups[minisizeId];

              const totalGroupSpend = group.reduce(
                (sum, entry) => sum + toNumber(entry.total),
                0
              );

              const matchingBonusItems = activeSpecialBonus.items.filter(
                (bonusItem) => Number(bonusItem.minisize.id) === minisizeId
              );

              const specialReward = getCumulativeSpecialBonusReward(
                matchingBonusItems,
                totalGroupSpend
              );

              for (const spendItem of group) {
                const found = cnBrand.find(
                  (entry) => Number(entry.brandId) === Number(spendItem.brandId)
                );

                if (found) {
                  found.cn = specialReward.cn;
                } else {
                  cnBrand.push({
                    brandId: Number(spendItem.brandId),
                    cn: specialReward.cn,
                  });
                }
              }
            }

            if (diffSpecialCn > 0) {
              await tx.user.update({
                where: { id: invoice.userId },
                data: {
                  cn: {
                    increment: diffSpecialCn,
                  },
                  cnBrand,
                },
              });
            } else {
              await tx.user.update({
                where: { id: invoice.userId },
                data: {
                  cnBrand,
                },
              });
            }
          }
        }

        // -----------------------------
        // 3) MARK INVOICE AS CHECKED
        // -----------------------------
        await tx.invoice.update({
          where: { id: invoice.id },
          data: {
            checked: true,
          },
        });
      });
    }

    // -----------------------------
    // 4) MERGE REWARD DELTA
    // -----------------------------
    const mergedRewardDeltas = Object.values(
      rewardPointHistoryObj.reduce((acc, curr) => {
        const key = `${curr.userId}-${curr.rewardPointId}`;

        if (!acc[key]) {
          acc[key] = { ...curr };
        } else {
          acc[key].point += curr.point;
          acc[key].incentivePoint += curr.incentivePoint;
          acc[key].loyaltyPoint += curr.loyaltyPoint;
          acc[key].totalPoint += curr.totalPoint;
          acc[key].totalSpend += curr.totalSpend;
        }

        return acc;
      }, {})
    );

    // -----------------------------
    // 5) UPDATE REWARD POINT HISTORY
    // -----------------------------
    for (const mergedItem of mergedRewardDeltas) {
      const rewardPoint = await prisma.rewardPoint.findUnique({
        where: {
          id: mergedItem.rewardPointId,
        },
      });

      if (!rewardPoint) continue;

      const totalPurchaseHistory = rewardPoint.totalPurchaseId
        ? await prisma.totalPurchaseHistory.findUnique({
            where: {
              userId_totalPurchaseId: {
                userId: mergedItem.userId,
                totalPurchaseId: rewardPoint.totalPurchaseId,
              },
            },
          })
        : null;

      const existingRewardHistory = await prisma.rewardPointHistory.findUnique({
        where: {
          userId_rewardPointId: {
            userId: mergedItem.userId,
            rewardPointId: mergedItem.rewardPointId,
          },
        },
      });

      if (!existingRewardHistory) continue;

      const totalSpend = totalPurchaseHistory
        ? toNumber(totalPurchaseHistory.totalSpend)
        : toNumber(existingRewardHistory.totalSpend);

      const calculatedPoint =
        rewardPoint.expenses > 0
          ? Math.floor((totalSpend * rewardPoint.point) / rewardPoint.expenses)
          : 0;

      await prisma.rewardPointHistory.update({
        where: {
          id: existingRewardHistory.id,
        },
        data: {
          point: calculatedPoint,
          incentivePoint:
            toNumber(existingRewardHistory.incentivePoint) +
            toNumber(mergedItem.incentivePoint),
          loyaltyPoint:
            toNumber(existingRewardHistory.loyaltyPoint) +
            toNumber(mergedItem.loyaltyPoint),
          totalPoint:
            calculatedPoint +
            (toNumber(existingRewardHistory.incentivePoint) +
              toNumber(mergedItem.incentivePoint)) +
            (toNumber(existingRewardHistory.loyaltyPoint) +
              toNumber(mergedItem.loyaltyPoint)) -
            toNumber(existingRewardHistory.usedPoint),
          totalSpend: totalSpend,
        },
      });

      // optional: sync user.rewardPoint
      // const latestRewardHistory = await prisma.rewardPointHistory.findUnique({
      //   where: {
      //     userId_rewardPointId: {
      //       userId: mergedItem.userId,
      //       rewardPointId: mergedItem.rewardPointId,
      //     },
      //   },
      // });
      //
      // if (latestRewardHistory) {
      //   await prisma.user.update({
      //     where: { id: mergedItem.userId },
      //     data: {
      //       rewardPoint: latestRewardHistory.totalPoint,
      //     },
      //   });
      // }
    }

    console.log("saveHistory completed successfully");
  } catch (error) {
    console.error("An error occurred:", error);
  } finally {
    await prisma.$disconnect();
  }
};

saveHistory().catch(console.error);