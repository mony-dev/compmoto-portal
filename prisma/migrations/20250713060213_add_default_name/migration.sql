/*
  Warnings:

  - Made the column `name` on table `SpecialBonus` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "SpecialBonus" ALTER COLUMN "name" SET NOT NULL,
ALTER COLUMN "name" SET DEFAULT 'name';

-- AlterTable
ALTER TABLE "TotalPurchase" ALTER COLUMN "name" SET DEFAULT 'name';
