/*
  Warnings:

  - You are about to drop the column `CustomerGroupId` on the `users` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "users" DROP CONSTRAINT "users_CustomerGroupId_fkey";

-- AlterTable
ALTER TABLE "users" DROP COLUMN "CustomerGroupId",
ADD COLUMN     "customerGroupId" INTEGER;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_customerGroupId_fkey" FOREIGN KEY ("customerGroupId") REFERENCES "CustomerGroup"("id") ON DELETE SET NULL ON UPDATE CASCADE;
