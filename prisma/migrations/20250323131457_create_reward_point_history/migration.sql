-- CreateTable
CREATE TABLE "RewardPointHistory" (
    "id" SERIAL NOT NULL,
    "month" INTEGER NOT NULL,
    "year" INTEGER NOT NULL,
    "resetDate" TIMESTAMP(3) NOT NULL,
    "isFinalize" BOOLEAN NOT NULL,
    "expenses" INTEGER NOT NULL,
    "point" INTEGER NOT NULL,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL,

    CONSTRAINT "RewardPointHistory_pkey" PRIMARY KEY ("id")
);
