/*
  Warnings:

  - A unique constraint covering the columns `[name]` on the table `CustomerGroup` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "CustomerGroup_name_key" ON "CustomerGroup"("name");
