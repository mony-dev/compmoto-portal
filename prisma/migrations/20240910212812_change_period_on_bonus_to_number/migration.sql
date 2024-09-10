/*
  Warnings:

  - Changed the type of `period` on the `SpecialBonus` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `period` on the `TotalPurchase` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "SpecialBonus" DROP COLUMN "period",
ADD COLUMN     "period" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "TotalPurchase" DROP COLUMN "period",
ADD COLUMN     "period" INTEGER NOT NULL;

-- DropEnum
DROP TYPE "PeriodType";
