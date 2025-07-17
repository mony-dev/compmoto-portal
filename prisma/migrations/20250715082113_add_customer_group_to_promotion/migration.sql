-- AlterTable
ALTER TABLE "Promotion" ADD COLUMN     "customerGroupId" INTEGER;

-- AddForeignKey
ALTER TABLE "Promotion" ADD CONSTRAINT "Promotion_customerGroupId_fkey" FOREIGN KEY ("customerGroupId") REFERENCES "CustomerGroup"("id") ON DELETE SET NULL ON UPDATE CASCADE;
