/*
  Warnings:

  - Made the column `minisizeId` on table `SpecialBonusItem` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "SpecialBonusItem" DROP CONSTRAINT "SpecialBonusItem_minisizeId_fkey";

-- AlterTable
ALTER TABLE "SpecialBonusItem" ALTER COLUMN "minisizeId" SET NOT NULL,
ALTER COLUMN "minisizeId" SET DEFAULT 1;

-- AddForeignKey
ALTER TABLE "SpecialBonusItem" ADD CONSTRAINT "SpecialBonusItem_minisizeId_fkey" FOREIGN KEY ("minisizeId") REFERENCES "Minisize"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
