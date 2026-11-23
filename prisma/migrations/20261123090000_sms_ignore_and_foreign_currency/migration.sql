-- AlterTable
ALTER TABLE "MerchantRule" ADD COLUMN     "ignore" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Transaction" ADD COLUMN     "foreignAmount" DOUBLE PRECISION,
ADD COLUMN     "foreignCurrency" TEXT;
