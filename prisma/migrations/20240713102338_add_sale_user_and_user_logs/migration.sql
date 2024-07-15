/*
  Warnings:

  - You are about to drop the `admins` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `verification_tokens` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "verification_tokens" DROP CONSTRAINT "verification_tokens_admin_id_fkey";

-- DropForeignKey
ALTER TABLE "verification_tokens" DROP CONSTRAINT "verification_tokens_user_id_fkey";

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "saleUserId" INTEGER;

-- DropTable
DROP TABLE "admins";

-- DropTable
DROP TABLE "verification_tokens";

-- CreateTable
CREATE TABLE "user_logs" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "ipAddress" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "user_logs_id_idx" ON "user_logs"("id");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_saleUserId_fkey" FOREIGN KEY ("saleUserId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_logs" ADD CONSTRAINT "user_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
