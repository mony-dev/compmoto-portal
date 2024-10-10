/*
  Warnings:

  - You are about to drop the column `brandProductId` on the `Minisize` table. All the data in the column will be lost.
  - You are about to drop the column `brandProductId` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the `BrandProduct` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Minisize" DROP CONSTRAINT "Minisize_brandProductId_fkey";

-- DropForeignKey
ALTER TABLE "Product" DROP CONSTRAINT "Product_brandProductId_fkey";

-- AlterTable
ALTER TABLE "Minisize" DROP COLUMN "brandProductId";

-- AlterTable
ALTER TABLE "Product" DROP COLUMN "brandProductId";

-- DropTable
DROP TABLE "BrandProduct";
