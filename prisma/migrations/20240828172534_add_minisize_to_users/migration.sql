/*
  Warnings:

  - Added the required column `userId` to the `Minisize` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Image" DROP CONSTRAINT "Image_rewardAlbumId_fkey";

-- AlterTable
ALTER TABLE "Minisize" ADD COLUMN     "userId" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "Image" ADD CONSTRAINT "Image_rewardAlbumId_fkey" FOREIGN KEY ("rewardAlbumId") REFERENCES "RewardAlbum"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Minisize" ADD CONSTRAINT "Minisize_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
