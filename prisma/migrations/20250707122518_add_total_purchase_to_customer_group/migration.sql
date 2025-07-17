-- AlterTable
ALTER TABLE "TotalPurchase" ADD COLUMN     "customerGroupId" INTEGER;

-- AddForeignKey
ALTER TABLE "TotalPurchase" ADD CONSTRAINT "TotalPurchase_customerGroupId_fkey" FOREIGN KEY ("customerGroupId") REFERENCES "CustomerGroup"("id") ON DELETE SET NULL ON UPDATE CASCADE;
