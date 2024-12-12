/*
  Warnings:

  - A unique constraint covering the columns `[custNo]` on the table `users` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "users_custNo_key" ON "users"("custNo");
