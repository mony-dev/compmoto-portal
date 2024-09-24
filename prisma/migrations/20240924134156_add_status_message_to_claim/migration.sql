-- AlterEnum
ALTER TYPE "ImageClaimType" ADD VALUE 'file';

-- AlterTable
ALTER TABLE "Claim" ADD COLUMN     "statusMessage" TEXT;
