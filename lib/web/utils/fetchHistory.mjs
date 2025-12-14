// import { PrismaClient } from '@prisma/client';
// const prisma = new PrismaClient();
// const fetchHistory = async () => {
//     try {
//         const start = new Date();
//         const month = start.getUTCMonth() + 1; // Month as a number (1-12)
//         const year = start.getUTCFullYear();
//         // Step 7: Check for active TotalPurchase and handle TotalPurchaseHistory
//         const activeTotalPurchase = await prisma.totalPurchase.findFirst({
//             where: { isActive: true },
//             include: {
//                 items: true,
//             },
//         });

//         // Step 8: Check for active SpecialBonus and handle SpecialBonusHistory
//         const activeSpecialBonus = await prisma.specialBonus.findFirst({
//             where: { isActive: true },
//             include: {
//                 items: {
//                     include: {
//                         minisize: {
//                             include: { brands: true }
//                         }
//                     }
//                 }, // Include related SpecialBonusItems
//             },
//         });

//         // Step 8.1: Check for current rewardPoint
//         const currentRewardPoint = await prisma.rewardPoint.findFirst({
//             where: { month: month, year: year },
//             include: {
//                 rewardPointHistories: true,
//             },
//         });
//         const activeMonth = activeTotalPurchase.month
//         const uncheckedInvoices = await prisma.invoice.findMany({
//             where: {
//                 checked: false,
//                 // AND: [
//                 //     {
//                 //         date: {
//                 //             gte: new Date(`${new Date().getFullYear()}-${activeMonth}-01`), // Start of activeTotalPurchase month
//                 //         },
//                 //     },
//                 //     {
//                 //         date: {
//                 //             lt: new Date(`${new Date().getFullYear()}-${activeMonth + 1}-01`), // Start of the next month
//                 //         },
//                 //     },
//                 // ],
//             },
//             include: {
//                 items: {
//                     include: {
//                         product: true,
//                     },
//                 },
//                 user: true,
//             },
//         });

//         let rewardPointHistoryObj = []

//         for (const invoice of uncheckedInvoices) {
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
//                             // level: matchingItem.order,
//                             // cn: matchingItem.cn,
//                             // incentivePoint:
//                             //     matchingItem.incentivePoint,
//                             // loyaltyPoint:
//                             //     matchingItem.loyaltyPoint,
//                         },
//                     });
//                     // Update the User model with the new points and cn
//                     await prisma.user.update({
//                         where: { id: invoice.userId },
//                         data: {
//                             cn: { increment: matchingItem.cn },
//                         },
//                     });
//                 }
//             }

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
//         const mergedHistoryObj = Object.values(
//             rewardPointHistoryObj.reduce((acc, curr) => {
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
//                             lastItem.incentivePoint,
//                             loyaltyPoint:
//                             lastItem.loyaltyPoint,
//                         },
//                     });
//                 }
//             }

//             //if this invoice in the pass book
//             if (currentRewardPoint.isFinalize) {
//                 const pointAfter = Math.floor(((mergedItem.totalSpend) * currentRewardPoint.point) / currentRewardPoint.expenses)
//                 const user = await prisma.user.findFirst({
//                     where: {
//                         id: mergedItem.userId
//                     },
//                 });
//                 const update = await prisma.user.update({
//                     where: {
//                       id: mergedItem.userId,
//                     },
//                     data: {
//                       rewardPoint: user.rewardPoint + pointAfter + mergedItem.incentivePoint,
//                     },
//                   });
//             }
//         }


//     } catch (error) {
//         console.error('An error occurred:', error);
//     } finally {
//         await prisma.$disconnect()
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


// fetchHistory().catch(console.error);

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const BATCH_SIZE = Number(process.env.HISTORY_BATCH_SIZE ?? 50); 
const SLEEP_MS = Number(process.env.HISTORY_SLEEP_MS ?? 0);      

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const fetchHistory = async () => {
  try {
    console.log("=== Start Fetch History (Batched) ===");

    const now = new Date();
    const month = now.getUTCMonth() + 1;
    const year = now.getUTCFullYear();

    // ✅ preload configs (active*)
    const [activeTotalPurchase, activeSpecialBonus, currentRewardPoint] =
      await Promise.all([
        prisma.totalPurchase.findFirst({
          where: { isActive: true },
          include: { items: true },
        }),
        prisma.specialBonus.findFirst({
          where: { isActive: true },
          include: {
            items: { include: { minisize: { include: { brands: true } } } },
          },
        }),
        prisma.rewardPoint.findFirst({
          where: { month, year },
          include: { rewardPointHistories: true },
        }),
      ]);

    if (!currentRewardPoint) {
      console.warn(`⚠ rewardPoint config not found for ${month}/${year}. Stop.`);
      return;
    }

    if (!activeTotalPurchase && !activeSpecialBonus) {
      console.warn("⚠ No activeTotalPurchase and no activeSpecialBonus. Stop.");
      return;
    }

    let processed = 0;
    let loop = 0;

    while (true) {
      loop += 1;

      // ✅ ดึง invoice ที่ยังไม่ checked แบบ batch
      const invoices = await prisma.invoice.findMany({
        where: { checked: false },
        include: {
          items: { include: { product: true } },
          user: true,
        },
        take: BATCH_SIZE,
        orderBy: { id: "asc" },
      });

      if (!invoices.length) break;

      console.log(`Batch #${loop} -> invoices=${invoices.length}`);

      // เก็บ reward history แบบรวม เพื่ออัปเดตทีหลัง
      const rewardPointHistoryObj = [];

      for (const invoice of invoices) {
        // ✅ กัน race: mark checked=true แบบ atomic ก่อน
        // ถ้า invoice นี้ถูก process ไปแล้วใน process อื่น -> skip
        const locked = await prisma.invoice.updateMany({
          where: { id: invoice.id, checked: false },
          data: { checked: true },
        });
        if (locked.count === 0) continue;

        processed += 1;

        // ---------------- TotalPurchase ----------------
        if (activeTotalPurchase) {
          const price = invoice.totalPrice ?? 0;

          // totalPurchaseHistory
          const tph = await prisma.totalPurchaseHistory.upsert({
            where: {
              // ต้องมี unique composite (userId,totalPurchaseId) ใน schema ถึงจะใช้แบบนี้ได้
              // ถ้ายังไม่มี ให้ใช้ findFirst+create แบบเดิม
              userId_totalPurchaseId: {
                userId: invoice.userId,
                totalPurchaseId: activeTotalPurchase.id,
              },
            },
            update: {},
            create: {
              userId: invoice.userId,
              totalPurchaseId: activeTotalPurchase.id,
              totalSpend: 0,
              level: 0,
              cn: 0,
              incentivePoint: 0,
              loyaltyPoint: 0,
            },
          });

          // rewardPointHistory
          const rph = await prisma.rewardPointHistory.upsert({
            where: {
              userId_rewardPointId: {
                userId: invoice.userId,
                rewardPointId: currentRewardPoint.id,
              },
            },
            update: {},
            create: {
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

          const matchingItems = activeTotalPurchase.items.filter(
            (it) => price >= it.totalPurchaseAmount
          );

          const best =
            matchingItems.length > 0
              ? matchingItems.reduce((prev, curr) =>
                  prev.order > curr.order ? prev : curr
                )
              : { order: 0, cn: 0, incentivePoint: 0, loyaltyPoint: 0 };

          const calIncentivePoint = best.incentivePoint ?? 0;
          const calLoyaltyPoint = best.loyaltyPoint ?? 0;

          rewardPointHistoryObj.push({
            userId: invoice.userId,
            rewardPointId: currentRewardPoint.id,
            point: 0,
            incentivePoint: calIncentivePoint,
            loyaltyPoint: calLoyaltyPoint,
            totalPoint: calIncentivePoint + calLoyaltyPoint,
            totalSpend: price,
          });

          // update totals
          await prisma.totalPurchaseHistory.update({
            where: { id: tph.id },
            data: { totalSpend: { increment: price } },
          });

          await prisma.user.update({
            where: { id: invoice.userId },
            data: { cn: { increment: best.cn ?? 0 } },
          });
        }

        // ---------------- SpecialBonus ----------------
        if (activeSpecialBonus) {
          // upsert histories
          const sbh = await prisma.specialBonusHistory.upsert({
            where: {
              userId_specialBonusId: {
                userId: invoice.userId,
                specialBonusId: activeSpecialBonus.id,
              },
            },
            update: {},
            create: {
              userId: invoice.userId,
              specialBonusId: activeSpecialBonus.id,
              totalSpend: [],
              cn: 0,
              incentivePoint: 0,
            },
          });

          await prisma.rewardPointHistory.upsert({
            where: {
              userId_rewardPointId: {
                userId: invoice.userId,
                rewardPointId: currentRewardPoint.id,
              },
            },
            update: {},
            create: {
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

          let totalSpend = Array.isArray(sbh.totalSpend) ? sbh.totalSpend : [];

          // process items
          for (const it of invoice.items) {
            const brandId = it?.product?.brandId;
            if (!brandId) continue;

            // matching bonus items by brand
            const matchingBonusItems = activeSpecialBonus.items.filter((bonusItem) =>
              bonusItem.minisize.brands.some((b) => b.brandId === brandId)
            );
            if (!matchingBonusItems.length) continue;

            const amount = it.discountPrice ?? 0;

            let brandEntry = totalSpend.find((x) => x.brandId === brandId);
            if (!brandEntry) {
              brandEntry = { brandId, total: 0, level: 0 };
              totalSpend.push(brandEntry);
            }
            brandEntry.total += amount;

            const eligible = matchingBonusItems.filter(
              (x) => brandEntry.total >= x.totalPurchaseAmount
            );
            const best =
              eligible.length > 0
                ? eligible.reduce((p, c) => (p.order > c.order ? p : c))
                : null;

            brandEntry.level = best?.order ?? brandEntry.level ?? 0;

            const matchingItemCn = best?.cn ?? 0;
            const matchingItemIncentivePoint = best?.incentivePoint ?? 0;

            // update specialBonusHistory (per invoice)
            await prisma.specialBonusHistory.update({
              where: { id: sbh.id },
              data: {
                totalSpend,
                cn: matchingItemCn,
                incentivePoint: matchingItemIncentivePoint,
              },
            });

            rewardPointHistoryObj.push({
              userId: invoice.userId,
              rewardPointId: currentRewardPoint.id,
              point: 0,
              incentivePoint: matchingItemIncentivePoint,
              loyaltyPoint: 0,
              totalPoint: matchingItemIncentivePoint,
              totalSpend: 0,
            });

            // update cnBrand JSON
            const user = await prisma.user.findUnique({
              where: { id: invoice.userId },
              select: { cnBrand: true, rewardPoint: true },
            });

            if (user) {
              const cnBrand = Array.isArray(user.cnBrand) ? user.cnBrand : [];
              const existing = cnBrand.find((x) => x.brandId === brandId);
              if (existing) existing.cn = matchingItemCn;
              else cnBrand.push({ brandId, cn: matchingItemCn });

              await prisma.user.update({
                where: { id: invoice.userId },
                data: { cnBrand },
              });
            }
          }
        }

        if (SLEEP_MS > 0) await sleep(SLEEP_MS);
      }

      // ✅ merge rewardPointHistoryObj by (userId, rewardPointId)
      const merged = Object.values(
        rewardPointHistoryObj.reduce((acc, curr) => {
          const key = `${curr.userId}-${curr.rewardPointId}`;
          if (!acc[key]) acc[key] = { ...curr };
          else {
            acc[key].incentivePoint += curr.incentivePoint;
            acc[key].loyaltyPoint += curr.loyaltyPoint;
            acc[key].totalPoint += curr.totalPoint;
            acc[key].totalSpend += curr.totalSpend;
          }
          return acc;
        }, {})
      );

      // ✅ apply merged updates
      for (const m of merged) {
        const [existing, existingHistory] = await Promise.all([
          prisma.rewardPointHistory.findFirst({
            where: { userId: m.userId, rewardPointId: m.rewardPointId },
          }),
          activeTotalPurchase
            ? prisma.totalPurchaseHistory.findFirst({
                where: { userId: m.userId, totalPurchaseId: activeTotalPurchase.id },
              })
            : Promise.resolve(null),
        ]);

        if (existing) {
          const point =
            existingHistory && currentRewardPoint.expenses
              ? ((existingHistory.totalSpend || 0) * currentRewardPoint.point) /
                currentRewardPoint.expenses
              : 0;

          await prisma.rewardPointHistory.update({
            where: { id: existing.id },
            data: {
              point,
              incentivePoint: existing.incentivePoint + m.incentivePoint,
              loyaltyPoint: existing.loyaltyPoint + m.loyaltyPoint,
              totalPoint: existing.totalPoint + m.totalPoint + point,
              totalSpend: existingHistory?.totalSpend ?? existing.totalSpend,
            },
          });

          // update level/cn from total purchase ladder (ถ้ามี)
          if (activeTotalPurchase && existingHistory) {
            const matching = activeTotalPurchase.items.filter(
              (it) => (existingHistory.totalSpend || 0) >= it.totalPurchaseAmount
            );
            if (matching.length) {
              const last = matching[matching.length - 1];
              await prisma.totalPurchaseHistory.update({
                where: { id: existingHistory.id },
                data: {
                  level: last.order,
                  cn: last.cn,
                  incentivePoint: last.incentivePoint,
                  loyaltyPoint: last.loyaltyPoint,
                },
              });
            }
          }

          // finalize -> update user.rewardPoint
          if (currentRewardPoint.isFinalize) {
            const pointAfter = Math.floor(
              (m.totalSpend * currentRewardPoint.point) / currentRewardPoint.expenses
            );

            const user = await prisma.user.findUnique({
              where: { id: m.userId },
              select: { rewardPoint: true },
            });

            if (user) {
              await prisma.user.update({
                where: { id: m.userId },
                data: {
                  rewardPoint: user.rewardPoint + pointAfter + m.incentivePoint,
                },
              });
            }
          }
        }
      }
    }

    console.log("=== Fetch History Completed ===");
    console.log(`Processed invoices: ${processed}`);
  } catch (error) {
    console.error("❌ fetchHistory error:", error);
  } finally {
    await prisma.$disconnect();
  }
};

fetchHistory().catch(console.error);
