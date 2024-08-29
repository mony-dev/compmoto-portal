/*
  Warnings:

  - You are about to drop the column `userId` on the `Minisize` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Minisize" DROP CONSTRAINT "Minisize_userId_fkey";

-- AlterTable
ALTER TABLE "Minisize" DROP COLUMN "userId";

-- CreateTable
CREATE TABLE "_UserMinisizes" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_UserMinisizes_AB_unique" ON "_UserMinisizes"("A", "B");

-- CreateIndex
CREATE INDEX "_UserMinisizes_B_index" ON "_UserMinisizes"("B");

-- AddForeignKey
ALTER TABLE "_UserMinisizes" ADD CONSTRAINT "_UserMinisizes_A_fkey" FOREIGN KEY ("A") REFERENCES "Minisize"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_UserMinisizes" ADD CONSTRAINT "_UserMinisizes_B_fkey" FOREIGN KEY ("B") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
