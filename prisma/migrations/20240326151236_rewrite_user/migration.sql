/*
  Warnings:

  - The primary key for the `users` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `users` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "Language" AS ENUM ('english', 'thai');

-- CreateEnum
CREATE TYPE "AdminRole" AS ENUM ('super_admin', 'admin', 'claim');

-- CreateEnum
CREATE TYPE "AdminStatus" AS ENUM ('pending', 'active', 'inactive');

-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('pending', 'active', 'inactive');

-- CreateEnum
CREATE TYPE "VerificationType" AS ENUM ('phone_authentication', 'reset_password');

-- AlterTable
ALTER TABLE "users" DROP CONSTRAINT "users_pkey",
ADD COLUMN     "language" "Language" NOT NULL DEFAULT 'english',
ADD COLUMN     "status" "UserStatus" NOT NULL DEFAULT 'pending',
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
ADD CONSTRAINT "users_pkey" PRIMARY KEY ("id");

-- CreateTable
CREATE TABLE "admins" (
    "id" SERIAL NOT NULL,
    "first_name" JSON NOT NULL DEFAULT '{}',
    "last_name" JSON NOT NULL DEFAULT '{}',
    "title" JSON NOT NULL DEFAULT '{}',
    "encrypted_password" VARCHAR(255) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "role" "AdminRole" NOT NULL,
    "status" "AdminStatus" NOT NULL DEFAULT 'active',
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL,
    "deleted_at" TIMESTAMP(6),
    "language" "Language" NOT NULL DEFAULT 'english',

    CONSTRAINT "admins_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "verification_tokens" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER,
    "admin_id" INTEGER,
    "verification_type" "VerificationType" NOT NULL,
    "token" VARCHAR(255) NOT NULL,
    "reference" VARCHAR(255) NOT NULL,
    "data" JSON NOT NULL DEFAULT '{}',
    "expired_at" TIMESTAMP(6) NOT NULL,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL,

    CONSTRAINT "verification_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sessions" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "session_token" TEXT NOT NULL,
    "refresh_token" TEXT NOT NULL,
    "expires_in" INTEGER NOT NULL,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL,

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "admins_email_key" ON "admins"("email");

-- CreateIndex
CREATE INDEX "admins_id_idx" ON "admins"("id");

-- CreateIndex
CREATE UNIQUE INDEX "verification_tokens_token_verification_type_key" ON "verification_tokens"("token", "verification_type");

-- CreateIndex
CREATE UNIQUE INDEX "verification_tokens_user_id_verification_type_key" ON "verification_tokens"("user_id", "verification_type");

-- CreateIndex
CREATE UNIQUE INDEX "verification_tokens_admin_id_verification_type_key" ON "verification_tokens"("admin_id", "verification_type");

-- CreateIndex
CREATE INDEX "users_id_idx" ON "users"("id");

-- AddForeignKey
ALTER TABLE "verification_tokens" ADD CONSTRAINT "verification_tokens_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "verification_tokens" ADD CONSTRAINT "verification_tokens_admin_id_fkey" FOREIGN KEY ("admin_id") REFERENCES "admins"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

