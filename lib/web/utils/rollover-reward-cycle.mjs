import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function rolloverRewardCycle() {
  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();

  return prisma.$transaction(async (tx) => {
    const [activeTotalPurchases, activeSpecialBonuses, finalizedRewardPoints] =
      await Promise.all([
        tx.totalPurchase.findMany({
          where: { isActive: true },
          include: {
            items: true,
          },
        }),
        tx.specialBonus.findMany({
          where: { isActive: true },
          include: {
            items: true,
          },
        }),
        tx.rewardPoint.findMany({
          where: { isFinalize: true },
        }),
      ]);

    if (
      activeTotalPurchases.length === 0 &&
      activeSpecialBonuses.length === 0 &&
      finalizedRewardPoints.length === 0
    ) {
      return {
        success: true,
        message: "No active/finalized records found.",
      };
    }

    const rewardPointIds = finalizedRewardPoints.map((rp) => rp.id);

    const rewardPointHistories =
      rewardPointIds.length > 0
        ? await tx.rewardPointHistory.findMany({
            where: {
              rewardPointId: { in: rewardPointIds },
            },
            select: {
              userId: true,
              totalPoint: true,
            },
          })
        : [];

    const userPointMap = new Map();

    for (const row of rewardPointHistories) {
      const prev = userPointMap.get(row.userId) ?? 0;
      userPointMap.set(row.userId, prev + row.totalPoint);
    }

    await Promise.all(
      Array.from(userPointMap.entries()).map(([userId, totalPointToAdd]) =>
        tx.user.update({
          where: { id: userId },
          data: {
            rewardPoint: {
              increment: totalPointToAdd,
            },
          },
        })
      )
    );

    if (activeTotalPurchases.length > 0) {
      await tx.totalPurchase.updateMany({
        where: {
          id: { in: activeTotalPurchases.map((x) => x.id) },
        },
        data: {
          isActive: false,
        },
      });
    }

    if (activeSpecialBonuses.length > 0) {
      await tx.specialBonus.updateMany({
        where: {
          id: { in: activeSpecialBonuses.map((x) => x.id) },
        },
        data: {
          isActive: false,
        },
      });
    }

    if (finalizedRewardPoints.length > 0) {
      await tx.rewardPoint.updateMany({
        where: {
          id: { in: finalizedRewardPoints.map((x) => x.id) },
        },
        data: {
          isFinalize: false,
        },
      });
    }

    const totalPurchaseIdMap = new Map();
    const specialBonusIdMap = new Map();

    for (const oldTp of activeTotalPurchases) {
      const newTp = await tx.totalPurchase.create({
        data: {
          month: currentMonth,
          year: currentYear,
          name: oldTp.name,
          resetDate: oldTp.resetDate,
          isActive: true,
          customerGroupId: oldTp.customerGroupId,
          items: {
            create: oldTp.items.map((item) => ({
              totalPurchaseAmount: item.totalPurchaseAmount,
              cn: item.cn,
              incentivePoint: item.incentivePoint,
              loyaltyPoint: item.loyaltyPoint,
              order: item.order,
            })),
          },
        },
      });

      totalPurchaseIdMap.set(oldTp.id, newTp.id);
    }

    for (const oldSb of activeSpecialBonuses) {
      const newSb = await tx.specialBonus.create({
        data: {
          month: currentMonth,
          year: currentYear,
          resetDate: oldSb.resetDate,
          isActive: true,
          name: oldSb.name,
          customerGroupId: oldSb.customerGroupId,
          items: {
            create: oldSb.items.map((item) => ({
              totalPurchaseAmount: item.totalPurchaseAmount,
              cn: item.cn,
              incentivePoint: item.incentivePoint,
              order: item.order,
              color: item.color,
              minisizeId: item.minisizeId,
            })),
          },
        },
      });

      specialBonusIdMap.set(oldSb.id, newSb.id);
    }

    for (const oldRp of finalizedRewardPoints) {
      await tx.rewardPoint.create({
        data: {
          month: currentMonth,
          year: currentYear,
          resetDate: oldRp.resetDate,
          isFinalize: true,
          expenses: oldRp.expenses,
          point: oldRp.point,
          name: oldRp.name,
          customerGroupId: oldRp.customerGroupId,
          totalPurchaseId: oldRp.totalPurchaseId
            ? totalPurchaseIdMap.get(oldRp.totalPurchaseId) ??
              oldRp.totalPurchaseId
            : null,
          specialBonusId: oldRp.specialBonusId
            ? specialBonusIdMap.get(oldRp.specialBonusId) ??
              oldRp.specialBonusId
            : null,
        },
      });
    }

    return {
      success: true,
      addedUserCount: userPointMap.size,
      totalPurchaseCloned: activeTotalPurchases.length,
      specialBonusCloned: activeSpecialBonuses.length,
      rewardPointCloned: finalizedRewardPoints.length,
    };
  });
}

async function main() {
  try {
    const result = await rolloverRewardCycle();
    console.log("Rollover success:", result);
  } catch (error) {
    console.error("Rollover failed:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();