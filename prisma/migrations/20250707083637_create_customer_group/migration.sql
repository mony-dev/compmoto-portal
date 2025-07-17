-- DropIndex
DROP INDEX "RewardPointHistory_userId_rewardPointId_key";

-- AlterTable
ALTER TABLE "TotalPurchase" ADD COLUMN     "name" TEXT;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "CustomerGroupId" INTEGER;

-- CreateTable
CREATE TABLE "CustomerGroup" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL,

    CONSTRAINT "CustomerGroup_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_CustomerGroupId_fkey" FOREIGN KEY ("CustomerGroupId") REFERENCES "CustomerGroup"("id") ON DELETE SET NULL ON UPDATE CASCADE;
