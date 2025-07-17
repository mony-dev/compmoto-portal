-- AlterTable
ALTER TABLE "RewardPoint" ADD COLUMN     "customerGroupId" INTEGER,
ADD COLUMN     "name" TEXT NOT NULL DEFAULT '';

-- AddForeignKey
ALTER TABLE "RewardPoint" ADD CONSTRAINT "RewardPoint_customerGroupId_fkey" FOREIGN KEY ("customerGroupId") REFERENCES "CustomerGroup"("id") ON DELETE SET NULL ON UPDATE CASCADE;
