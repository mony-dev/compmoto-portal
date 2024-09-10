/*
  Warnings:

  - Added the required column `isActive` to the `SpecialBonus` table without a default value. This is not possible if the table is not empty.
  - Added the required column `isActive` to the `TotalPurchase` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "SpecialBonus" ADD COLUMN     "isActive" BOOLEAN NOT NULL;

-- AlterTable
ALTER TABLE "TotalPurchase" ADD COLUMN     "isActive" BOOLEAN NOT NULL;
