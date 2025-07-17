-- AlterTable
ALTER TABLE "RewardPoint" ADD COLUMN     "specialBonusId" INTEGER,
ADD COLUMN     "totalPurchaseId" INTEGER;

-- AddForeignKey
ALTER TABLE "RewardPoint" ADD CONSTRAINT "RewardPoint_totalPurchaseId_fkey" FOREIGN KEY ("totalPurchaseId") REFERENCES "TotalPurchase"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RewardPoint" ADD CONSTRAINT "RewardPoint_specialBonusId_fkey" FOREIGN KEY ("specialBonusId") REFERENCES "SpecialBonus"("id") ON DELETE SET NULL ON UPDATE CASCADE;
