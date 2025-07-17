/*
  Warnings:

  - Made the column `name` on table `TotalPurchase` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "TotalPurchase" ALTER COLUMN "name" SET NOT NULL;
