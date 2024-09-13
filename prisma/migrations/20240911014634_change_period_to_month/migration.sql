/*
  Warnings:

  - You are about to drop the column `period` on the `SpecialBonus` table. All the data in the column will be lost.
  - You are about to drop the column `period` on the `TotalPurchase` table. All the data in the column will be lost.
  - Added the required column `month` to the `SpecialBonus` table without a default value. This is not possible if the table is not empty.
  - Added the required column `month` to the `TotalPurchase` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "SpecialBonus" DROP COLUMN "period",
ADD COLUMN     "month" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "TotalPurchase" DROP COLUMN "period",
ADD COLUMN     "month" INTEGER NOT NULL;
