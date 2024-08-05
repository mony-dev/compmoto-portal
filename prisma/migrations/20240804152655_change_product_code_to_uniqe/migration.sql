-- DropIndex
DROP INDEX "Product_productCode_key";

-- Add the new column with a default value
ALTER TABLE "Product" ADD COLUMN "code" TEXT NOT NULL DEFAULT 'default-code';

-- Update existing rows with unique values
UPDATE "Product" SET "code" = 'unique-code-value' WHERE "code" = 'default-code';

-- CreateIndex
CREATE UNIQUE INDEX "Product_code_key" ON "Product"("code");

-- Drop the default value constraint if not needed
ALTER TABLE "Product" ALTER COLUMN "code" DROP DEFAULT;