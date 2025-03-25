/*
  Warnings:

  - A unique constraint covering the columns `[userId,rewardPointId]` on the table `RewardPointHistory` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "RewardPointHistory_userId_rewardPointId_key" ON "RewardPointHistory"("userId", "rewardPointId");
