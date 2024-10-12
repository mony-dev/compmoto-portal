-- DropForeignKey
ALTER TABLE "SpecialBonusItem" DROP CONSTRAINT "SpecialBonusItem_minisizeId_fkey";

-- AlterTable
ALTER TABLE "SpecialBonusItem" ALTER COLUMN "minisizeId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "SpecialBonusItem" ADD CONSTRAINT "SpecialBonusItem_minisizeId_fkey" FOREIGN KEY ("minisizeId") REFERENCES "Minisize"("id") ON DELETE SET NULL ON UPDATE CASCADE;
