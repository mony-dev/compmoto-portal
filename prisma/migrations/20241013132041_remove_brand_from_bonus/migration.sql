/*
  Warnings:

  - You are about to drop the column `brandId` on the `SpecialBonusItem` table. All the data in the column will be lost.
  - Made the column `minisizeId` on table `SpecialBonusItem` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "SpecialBonusItem" DROP CONSTRAINT "SpecialBonusItem_brandId_fkey";

-- DropForeignKey
ALTER TABLE "SpecialBonusItem" DROP CONSTRAINT "SpecialBonusItem_minisizeId_fkey";

-- AlterTable
ALTER TABLE "SpecialBonusItem" DROP COLUMN "brandId",
ALTER COLUMN "minisizeId" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "SpecialBonusItem" ADD CONSTRAINT "SpecialBonusItem_minisizeId_fkey" FOREIGN KEY ("minisizeId") REFERENCES "Minisize"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
