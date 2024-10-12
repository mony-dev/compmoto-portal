/*
  Warnings:

  - Added the required column `minisizeId` to the `SpecialBonusItem` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "SpecialBonusItem" ADD COLUMN     "minisizeId" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "SpecialBonusItem" ADD CONSTRAINT "SpecialBonusItem_minisizeId_fkey" FOREIGN KEY ("minisizeId") REFERENCES "Minisize"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
