/*
  Warnings:

  - You are about to drop the column `document` on the `Invoice` table. All the data in the column will be lost.
  - Added the required column `documentNo` to the `Invoice` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Invoice" DROP COLUMN "document",
ADD COLUMN     "documentNo" TEXT NOT NULL;
