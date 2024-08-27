/*
  Warnings:

  - Added the required column `test` to the `Image` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Image" DROP CONSTRAINT "Image_rewardAlbumId_fkey";

-- AlterTable
ALTER TABLE "Image" ADD COLUMN     "test" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "Image" ADD CONSTRAINT "Image_rewardAlbumId_fkey" FOREIGN KEY ("rewardAlbumId") REFERENCES "RewardAlbum"("id") ON DELETE CASCADE ON UPDATE CASCADE;
