/*
  Warnings:

  - You are about to drop the column `rewardId` on the `RewardAlbum` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "RewardAlbum" DROP CONSTRAINT "RewardAlbum_rewardId_fkey";

-- DropIndex
DROP INDEX "RewardAlbum_rewardId_key";

-- AlterTable
ALTER TABLE "RewardAlbum" DROP COLUMN "rewardId";
