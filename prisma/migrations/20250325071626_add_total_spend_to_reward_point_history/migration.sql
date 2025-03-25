/*
  Warnings:

  - Added the required column `totalSpend` to the `RewardPointHistory` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "RewardPointHistory" ADD COLUMN     "totalSpend" INTEGER NOT NULL;
