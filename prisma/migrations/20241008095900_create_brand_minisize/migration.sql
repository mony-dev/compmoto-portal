/*
  Warnings:

  - You are about to drop the column `brandId` on the `Minisize` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Minisize" DROP CONSTRAINT "Minisize_brandId_fkey";

-- AlterTable
ALTER TABLE "Minisize" DROP COLUMN "brandId";

-- CreateTable
CREATE TABLE "BrandMinisize" (
    "brandId" INTEGER NOT NULL,
    "minisizeId" INTEGER NOT NULL,

    CONSTRAINT "BrandMinisize_pkey" PRIMARY KEY ("brandId","minisizeId")
);

-- AddForeignKey
ALTER TABLE "BrandMinisize" ADD CONSTRAINT "BrandMinisize_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "Brand"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BrandMinisize" ADD CONSTRAINT "BrandMinisize_minisizeId_fkey" FOREIGN KEY ("minisizeId") REFERENCES "Minisize"("id") ON DELETE CASCADE ON UPDATE CASCADE;
