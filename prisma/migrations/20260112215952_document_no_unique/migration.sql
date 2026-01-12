/*
  Warnings:

  - A unique constraint covering the columns `[documentNo]` on the table `MemoCredit` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "MemoCredit_documentNo_key" ON "MemoCredit"("documentNo");
