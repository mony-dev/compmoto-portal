-- CreateTable
CREATE TABLE "RewardCategory" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL,

    CONSTRAINT "RewardCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Image" (
    "id" SERIAL NOT NULL,
    "tableName" TEXT NOT NULL,
    "tableId" INTEGER NOT NULL,
    "image" TEXT NOT NULL,
    "file" TEXT NOT NULL,

    CONSTRAINT "Image_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Reward" (
    "id" SERIAL NOT NULL,
    "rewardCategoryId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "point" INTEGER NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "fileId" INTEGER NOT NULL,
    "imageId" INTEGER NOT NULL,

    CONSTRAINT "Reward_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RewardAlbum" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "rewardId" INTEGER NOT NULL,

    CONSTRAINT "RewardAlbum_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "RewardAlbum_rewardId_key" ON "RewardAlbum"("rewardId");

-- AddForeignKey
ALTER TABLE "Image" ADD CONSTRAINT "Image_tableId_fkey" FOREIGN KEY ("tableId") REFERENCES "RewardAlbum"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reward" ADD CONSTRAINT "Reward_rewardCategoryId_fkey" FOREIGN KEY ("rewardCategoryId") REFERENCES "RewardCategory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RewardAlbum" ADD CONSTRAINT "RewardAlbum_rewardId_fkey" FOREIGN KEY ("rewardId") REFERENCES "Reward"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
