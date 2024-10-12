import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
const fetchHistory = async () => {
    try {
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
                items: {
                    include: {
                        minisize: {
                            include: {brands: true}
                        }
                    }
                }, // Include related SpecialBonusItems
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
                    (item) => price >= item.totalPurchaseAmount
                );
                const matchingItem =
                    matchingItems.length > 0
                        ? matchingItems.reduce((prev, curr) =>
                            prev.order > curr.order ? prev : curr
                        )
                        : {order: 0, cn: 0, incentivePoint: 0, loyaltyPoint: 0};

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
                let existingSpecialBonusHistory =
                    await prisma.specialBonusHistory.findFirst({
                        where: {
                            userId: invoice.userId,
                            specialBonusId: activeSpecialBonus.id,
                        }
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
                        const brandId = item.product.brandId;
                        let brandIds = []
                        const matchingBonusItem = activeSpecialBonus.items.filter((bonusItem) => 
                            bonusItem.minisize.brands.some((brand) => brand.brandId === brandId)
                            // brandIds = bonusItem.minisize.brands.map((brand) => brand.brandId)
                        );
                        if (matchingBonusItem.length > 0) {
                            // Find if the brandId already exists in totalSpend
                            // console.log("matchingBonusItem", matchingBonusItem.minisize.brands)

                            let brandTotalEntry = (totalSpend).find(
                                (entry) => entry.brandId === brandId
                            );
                            const total = item.discountPrice;

                            // Check if the brandId already exists in totalSpend JSON
                            let matchingItemCn = 0;
                            let matchingItemIncentivePoint = 0;

                            if (brandTotalEntry) {
                                // Update the existing total and level
                                brandTotalEntry.total += total;
                                const matchingItems = matchingBonusItem.filter(
                                    (item) =>
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
                                    (item) => total >= item.totalPurchaseAmount
                                ); // Filter all items where price is greater or equal
                                // Get the item with the highest order
                                const matchingItem =
                                    matchingItems.length > 0
                                        ? matchingItems.reduce((prev, curr) =>
                                            prev.order > curr.order ? prev : curr
                                        )
                                        : null;
                                (totalSpend).push({
                                    brandId: brandId,
                                    total: total,
                                    level: matchingItem?.order,
                                });
                                matchingItemCn = matchingItem?.cn || 0;
                                matchingItemIncentivePoint =
                                    matchingItem?.incentivePoint || 0;
                            }
                            // Group totalSpend by minisize
                            const minisizeGroups = groupByMinisize(activeSpecialBonus.items, totalSpend);

                            // Update the levels for the grouped minisizes
                            await updateLevelsForMinisizes(minisizeGroups, activeSpecialBonus, totalSpend);

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
                                let cnBrand = (user.cnBrand) || [];

                                // Check if cnBrand is an array before using .find()
                                if (Array.isArray(cnBrand)) {
                                    const brandCnEntry = (cnBrand).find(
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
    } catch (error) {
        console.error('An error occurred:', error);
    }
};

const groupByMinisize = (items, totalSpend) => {
    const minisizeGroups = {};

    for (const spend of totalSpend) {
        const { brandId, total } = spend;

        // Find matching bonus items for this brandId
        const matchingBonusItems = items.filter((bonusItem) =>
            bonusItem.minisize.brands.some((brand) => brand.brandId === brandId)
        );

        // Group by minisize
        for (const bonusItem of matchingBonusItems) {
            const minisizeId = bonusItem.minisize.id;

            // Initialize group if not already present
            if (!minisizeGroups[minisizeId]) {
                minisizeGroups[minisizeId] = [];
            }

            // Check if the brandId already exists in this minisize group
            const existingBrand = minisizeGroups[minisizeId].find(
                (entry) => entry.brandId === brandId
            );

            // If the brandId doesn't exist, add it
            if (!existingBrand) {
                minisizeGroups[minisizeId].push({ brandId, total });
            } else {
                // If the brandId already exists, update the total (e.g., sum up the total)
                existingBrand.total;
            }
        }
    }

    return minisizeGroups;
};

const updateLevelsForMinisizes = async (minisizeGroups, activeSpecialBonus, totalSpend) => {
    for (const minisizeId in minisizeGroups) {
        const group = minisizeGroups[minisizeId];
        console.log("group", group)
        
        // Sum the total for this minisize group
        const totalGroupSpend = group.reduce((sum, item) => sum + item.total, 0);
        console.log("totalGroupSpend", totalGroupSpend)

        // Find the matching bonus items for this minisize
        const matchingBonusItems = activeSpecialBonus.items.filter(
            (item) => item.minisize.id === parseInt(minisizeId)
        );

        // Find the matching item where totalGroupSpend >= totalPurchaseAmount
        const matchingItem = matchingBonusItems
        .filter((item) => totalGroupSpend >= item.totalPurchaseAmount)
        .reduce((prev, curr) => {
            // Ensure prev is not null and check both prev.order and curr.order safely
            if (!prev || !prev.order) return curr;
            return (prev.order > curr.order ? prev : curr);
        }, null);
        console.log("matchingItem", matchingItem)

        if (matchingItem) {
            // Update the level for all brandIds in this group
            for (const spendItem of group) {
                const { brandId } = spendItem;

                // Update the level for this brandId in totalSpend
                const spendEntry = totalSpend.find(
                    (entry) => entry.brandId === brandId
                );

                if (spendEntry) {
                    spendEntry.level = matchingItem.order;
                }
            }
        }

    }
};


fetchHistory().catch(console.error);
