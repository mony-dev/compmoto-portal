/*
  Warnings:

  - Changed the type of `resetDate` on the `SpecialBonus` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `resetDate` on the `TotalPurchase` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "SpecialBonus" DROP COLUMN "resetDate",
ADD COLUMN     "resetDate" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "TotalPurchase" DROP COLUMN "resetDate",
ADD COLUMN     "resetDate" TIMESTAMP(3) NOT NULL;
