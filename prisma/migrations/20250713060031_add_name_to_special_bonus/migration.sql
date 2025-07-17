-- AlterTable
ALTER TABLE "SpecialBonus" ADD COLUMN     "customerGroupId" INTEGER,
ADD COLUMN     "name" TEXT;

-- AddForeignKey
ALTER TABLE "SpecialBonus" ADD CONSTRAINT "SpecialBonus_customerGroupId_fkey" FOREIGN KEY ("customerGroupId") REFERENCES "CustomerGroup"("id") ON DELETE SET NULL ON UPDATE CASCADE;
