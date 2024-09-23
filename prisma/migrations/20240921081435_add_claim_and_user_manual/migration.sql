-- CreateEnum
CREATE TYPE "ConditionType" AS ENUM ('before', 'after');

-- CreateEnum
CREATE TYPE "ClaimStatus" AS ENUM ('inProgress', 'complete', 'incomplete');

-- CreateEnum
CREATE TYPE "ImageClaimType" AS ENUM ('image', 'video');

-- CreateEnum
CREATE TYPE "ImageClaimRole" AS ENUM ('user', 'admin');

-- CreateTable
CREATE TABLE "Claim" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "productId" INTEGER NOT NULL,
    "condition" "ConditionType" NOT NULL,
    "details" TEXT NOT NULL,
    "claimNo" TEXT NOT NULL,
    "status" "ClaimStatus" NOT NULL,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL,

    CONSTRAINT "Claim_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ImageClaim" (
    "id" SERIAL NOT NULL,
    "claimId" INTEGER NOT NULL,
    "url" TEXT NOT NULL,
    "type" "ImageClaimType" NOT NULL,
    "role" "ImageClaimRole" NOT NULL,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL,

    CONSTRAINT "ImageClaim_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserManual" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL,

    CONSTRAINT "UserManual_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Claim" ADD CONSTRAINT "Claim_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Claim" ADD CONSTRAINT "Claim_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ImageClaim" ADD CONSTRAINT "ImageClaim_claimId_fkey" FOREIGN KEY ("claimId") REFERENCES "Claim"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
