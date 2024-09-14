-- AlterTable
ALTER TABLE "users" ADD COLUMN     "cn" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "cnBrand" JSONB,
ADD COLUMN     "loyaltyPoint" DOUBLE PRECISION NOT NULL DEFAULT 0,
ALTER COLUMN "rewardPoint" SET DEFAULT 0,
ALTER COLUMN "rewardPoint" SET DATA TYPE DOUBLE PRECISION;

-- CreateTable
CREATE TABLE "TotalPurchaseHistory" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "totalPurchaseId" INTEGER NOT NULL,
    "cn" DOUBLE PRECISION NOT NULL,
    "incentivePoint" DOUBLE PRECISION NOT NULL,
    "loyaltyPoint" DOUBLE PRECISION NOT NULL,
    "level" INTEGER NOT NULL,
    "totalSpend" DOUBLE PRECISION NOT NULL,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL,

    CONSTRAINT "TotalPurchaseHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SpecialBonusHistory" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "specialBonusId" INTEGER NOT NULL,
    "cn" DOUBLE PRECISION NOT NULL,
    "incentivePoint" DOUBLE PRECISION NOT NULL,
    "totalSpend" JSONB NOT NULL,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL,

    CONSTRAINT "SpecialBonusHistory_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "TotalPurchaseHistory" ADD CONSTRAINT "TotalPurchaseHistory_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TotalPurchaseHistory" ADD CONSTRAINT "TotalPurchaseHistory_totalPurchaseId_fkey" FOREIGN KEY ("totalPurchaseId") REFERENCES "TotalPurchase"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SpecialBonusHistory" ADD CONSTRAINT "SpecialBonusHistory_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SpecialBonusHistory" ADD CONSTRAINT "SpecialBonusHistory_specialBonusId_fkey" FOREIGN KEY ("specialBonusId") REFERENCES "SpecialBonus"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
