-- AlterTable
ALTER TABLE "users" ADD COLUMN     "balanceLCY" INTEGER,
ADD COLUMN     "birthDate" TIMESTAMP(3),
ADD COLUMN     "contactName" TEXT,
ADD COLUMN     "creditPoint" INTEGER DEFAULT 0,
ADD COLUMN     "custAddress" TEXT,
ADD COLUMN     "gender" TEXT,
ADD COLUMN     "paymentTerms" TEXT,
ADD COLUMN     "phoneNumber" TEXT,
ADD COLUMN     "rewardPoint" INTEGER DEFAULT 0,
ADD COLUMN     "shipToAddress" TEXT,
ADD COLUMN     "vatNo" INTEGER;
