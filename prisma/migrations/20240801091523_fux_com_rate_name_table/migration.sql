/*
  Warnings:

  - You are about to drop the `ComReate` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "ComReate";

-- CreateTable
CREATE TABLE "ComRate" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ComRate_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ComRate_name_key" ON "ComRate"("name");
