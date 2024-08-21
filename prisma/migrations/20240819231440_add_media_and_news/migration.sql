-- CreateEnum
CREATE TYPE "MediaType" AS ENUM ('file', 'video', 'image');

-- CreateTable
CREATE TABLE "Media" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "isActive" BOOLEAN NOT NULL,
    "name" TEXT NOT NULL,
    "minisizeId" INTEGER NOT NULL,
    "image" TEXT NOT NULL,
    "type" "MediaType" NOT NULL,
    "url" TEXT NOT NULL,
    "coverImg" TEXT NOT NULL,

    CONSTRAINT "Media_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "News" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "isActive" BOOLEAN NOT NULL,
    "name" TEXT NOT NULL,
    "minisizeId" INTEGER NOT NULL,
    "coverImg" TEXT NOT NULL,
    "content" TEXT NOT NULL,

    CONSTRAINT "News_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Media" ADD CONSTRAINT "Media_minisizeId_fkey" FOREIGN KEY ("minisizeId") REFERENCES "Minisize"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "News" ADD CONSTRAINT "News_minisizeId_fkey" FOREIGN KEY ("minisizeId") REFERENCES "Minisize"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
