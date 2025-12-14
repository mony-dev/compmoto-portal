/*
  Warnings:

  - A unique constraint covering the columns `[userId,rewardPointId]` on the table `RewardPointHistory` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[userId,specialBonusId]` on the table `SpecialBonusHistory` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[userId,totalPurchaseId]` on the table `TotalPurchaseHistory` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "RewardPointHistory_userId_rewardPointId_key" ON "RewardPointHistory"("userId", "rewardPointId");

-- CreateIndex
CREATE UNIQUE INDEX "SpecialBonusHistory_userId_specialBonusId_key" ON "SpecialBonusHistory"("userId", "specialBonusId");

-- CreateIndex
CREATE UNIQUE INDEX "TotalPurchaseHistory_userId_totalPurchaseId_key" ON "TotalPurchaseHistory"("userId", "totalPurchaseId");
