/*
  Warnings:

  - Added the required column `brandProductId` to the `Minisize` table without a default value. This is not possible if the table is not empty.
  - Added the required column `brandProductId` to the `Product` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Minisize" ADD COLUMN     "brandProductId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "brandProductId" INTEGER NOT NULL;

-- CreateTable
CREATE TABLE "BrandProduct" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BrandProduct_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "BrandProduct_name_key" ON "BrandProduct"("name");

-- AddForeignKey
ALTER TABLE "Minisize" ADD CONSTRAINT "Minisize_brandProductId_fkey" FOREIGN KEY ("brandProductId") REFERENCES "BrandProduct"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_brandProductId_fkey" FOREIGN KEY ("brandProductId") REFERENCES "BrandProduct"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
