-- DropForeignKey
ALTER TABLE "Promotion" DROP CONSTRAINT "Promotion_minisizeId_fkey";

-- AlterTable
ALTER TABLE "Promotion" ALTER COLUMN "minisizeId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Promotion" ADD CONSTRAINT "Promotion_minisizeId_fkey" FOREIGN KEY ("minisizeId") REFERENCES "Minisize"("id") ON DELETE SET NULL ON UPDATE CASCADE;
