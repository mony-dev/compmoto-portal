/*
  Warnings:

  - You are about to drop the column `file` on the `Image` table. All the data in the column will be lost.
  - You are about to drop the column `image` on the `Image` table. All the data in the column will be lost.
  - You are about to drop the column `tableId` on the `Image` table. All the data in the column will be lost.
  - You are about to drop the column `tableName` on the `Image` table. All the data in the column will be lost.
  - You are about to drop the column `fileId` on the `Reward` table. All the data in the column will be lost.
  - You are about to drop the column `imageId` on the `Reward` table. All the data in the column will be lost.
  - Added the required column `rewardAlbumId` to the `Image` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `Image` table without a default value. This is not possible if the table is not empty.
  - Added the required column `url` to the `Image` table without a default value. This is not possible if the table is not empty.
  - Added the required column `file` to the `Reward` table without a default value. This is not possible if the table is not empty.
  - Added the required column `image` to the `Reward` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `Reward` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `RewardAlbum` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `RewardCategory` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Image" DROP CONSTRAINT "Image_tableId_fkey";

-- AlterTable
ALTER TABLE "Image" DROP COLUMN "file",
DROP COLUMN "image",
DROP COLUMN "tableId",
DROP COLUMN "tableName",
ADD COLUMN     "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "rewardAlbumId" INTEGER NOT NULL,
ADD COLUMN     "updated_at" TIMESTAMP(6) NOT NULL,
ADD COLUMN     "url" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Reward" DROP COLUMN "fileId",
DROP COLUMN "imageId",
ADD COLUMN     "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "file" TEXT NOT NULL,
ADD COLUMN     "image" TEXT NOT NULL,
ADD COLUMN     "updated_at" TIMESTAMP(6) NOT NULL;

-- AlterTable
ALTER TABLE "RewardAlbum" ADD COLUMN     "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updated_at" TIMESTAMP(6) NOT NULL;

-- AlterTable
ALTER TABLE "RewardCategory" ADD COLUMN     "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updated_at" TIMESTAMP(6) NOT NULL;

-- AddForeignKey
ALTER TABLE "Image" ADD CONSTRAINT "Image_rewardAlbumId_fkey" FOREIGN KEY ("rewardAlbumId") REFERENCES "RewardAlbum"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
