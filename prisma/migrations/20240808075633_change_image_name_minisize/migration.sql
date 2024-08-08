/*
  Warnings:

  - You are about to drop the column `test` on the `Minisize` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Minisize" DROP COLUMN "test",
ADD COLUMN     "imageProfile" TEXT;
