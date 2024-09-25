-- CreateTable
CREATE TABLE "MemoCredit" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "documentNo" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "totalAmount" INTEGER NOT NULL,
    "amountIncludingVAT" INTEGER NOT NULL,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL,

    CONSTRAINT "MemoCredit_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "MemoCredit" ADD CONSTRAINT "MemoCredit_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
