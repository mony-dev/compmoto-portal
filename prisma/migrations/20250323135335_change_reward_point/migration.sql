/*
  Warnings:

  - You are about to drop the column `expenses` on the `RewardPointHistory` table. All the data in the column will be lost.
  - You are about to drop the column `isFinalize` on the `RewardPointHistory` table. All the data in the column will be lost.
  - You are about to drop the column `month` on the `RewardPointHistory` table. All the data in the column will be lost.
  - You are about to drop the column `resetDate` on the `RewardPointHistory` table. All the data in the column will be lost.
  - You are about to drop the column `year` on the `RewardPointHistory` table. All the data in the column will be lost.
  - Added the required column `incentivePoint` to the `RewardPointHistory` table without a default value. This is not possible if the table is not empty.
  - Added the required column `loyaltyPoint` to the `RewardPointHistory` table without a default value. This is not possible if the table is not empty.
  - Added the required column `rewardPointId` to the `RewardPointHistory` table without a default value. This is not possible if the table is not empty.
  - Added the required column `totalPoint` to the `RewardPointHistory` table without a default value. This is not possible if the table is not empty.
  - Added the required column `usedPoint` to the `RewardPointHistory` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `RewardPointHistory` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "RewardPointHistory" DROP COLUMN "expenses",
DROP COLUMN "isFinalize",
DROP COLUMN "month",
DROP COLUMN "resetDate",
DROP COLUMN "year",
ADD COLUMN     "incentivePoint" INTEGER NOT NULL,
ADD COLUMN     "loyaltyPoint" INTEGER NOT NULL,
ADD COLUMN     "rewardPointId" INTEGER NOT NULL,
ADD COLUMN     "totalPoint" INTEGER NOT NULL,
ADD COLUMN     "usedPoint" INTEGER NOT NULL,
ADD COLUMN     "userId" INTEGER NOT NULL;

-- CreateTable
CREATE TABLE "RewardPoint" (
    "id" SERIAL NOT NULL,
    "month" INTEGER NOT NULL,
    "year" INTEGER NOT NULL,
    "resetDate" TIMESTAMP(3) NOT NULL,
    "isFinalize" BOOLEAN NOT NULL,
    "expenses" INTEGER NOT NULL,
    "point" INTEGER NOT NULL,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL,

    CONSTRAINT "RewardPoint_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "RewardPointHistory" ADD CONSTRAINT "RewardPointHistory_rewardPointId_fkey" FOREIGN KEY ("rewardPointId") REFERENCES "RewardPoint"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RewardPointHistory" ADD CONSTRAINT "RewardPointHistory_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
