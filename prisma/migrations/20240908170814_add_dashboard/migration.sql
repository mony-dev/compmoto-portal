-- CreateEnum
CREATE TYPE "PeriodType" AS ENUM ('monthly', 'quarter');

-- CreateTable
CREATE TABLE "TotalPurchase" (
    "id" SERIAL NOT NULL,
    "period" "PeriodType" NOT NULL,
    "year" INTEGER NOT NULL,
    "resetDate" INTEGER NOT NULL,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL,

    CONSTRAINT "TotalPurchase_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TotalPurchaseItem" (
    "id" SERIAL NOT NULL,
    "totalPurchaseId" INTEGER NOT NULL,
    "totalPurchaseAmount" INTEGER NOT NULL,
    "cn" INTEGER NOT NULL,
    "incentivePoint" INTEGER NOT NULL,
    "loyaltyPoint" INTEGER NOT NULL,
    "order" INTEGER NOT NULL,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL,

    CONSTRAINT "TotalPurchaseItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SpecialBonus" (
    "id" SERIAL NOT NULL,
    "period" "PeriodType" NOT NULL,
    "year" INTEGER NOT NULL,
    "resetDate" INTEGER NOT NULL,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL,

    CONSTRAINT "SpecialBonus_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SpecialBonusItem" (
    "id" SERIAL NOT NULL,
    "specialBonusId" INTEGER NOT NULL,
    "totalPurchaseAmount" INTEGER NOT NULL,
    "cn" INTEGER NOT NULL,
    "incentivePoint" INTEGER NOT NULL,
    "order" INTEGER NOT NULL,
    "brandId" INTEGER NOT NULL,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL,

    CONSTRAINT "SpecialBonusItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "TotalPurchaseItem_totalPurchaseId_key" ON "TotalPurchaseItem"("totalPurchaseId");

-- CreateIndex
CREATE UNIQUE INDEX "SpecialBonusItem_specialBonusId_key" ON "SpecialBonusItem"("specialBonusId");

-- AddForeignKey
ALTER TABLE "TotalPurchaseItem" ADD CONSTRAINT "TotalPurchaseItem_totalPurchaseId_fkey" FOREIGN KEY ("totalPurchaseId") REFERENCES "TotalPurchase"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SpecialBonusItem" ADD CONSTRAINT "SpecialBonusItem_specialBonusId_fkey" FOREIGN KEY ("specialBonusId") REFERENCES "SpecialBonus"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SpecialBonusItem" ADD CONSTRAINT "SpecialBonusItem_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "Brand"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
