/*
  Warnings:

  - You are about to drop the `ImagePromotion` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `image` to the `Promotion` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "ImagePromotion" DROP CONSTRAINT "ImagePromotion_promotionId_fkey";

-- AlterTable
ALTER TABLE "Promotion" ADD COLUMN     "image" TEXT NOT NULL;

-- DropTable
DROP TABLE "ImagePromotion";
