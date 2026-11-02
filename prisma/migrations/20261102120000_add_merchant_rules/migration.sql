-- AlterTable
ALTER TABLE "Transaction" ADD COLUMN     "needsReview" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "MerchantRule" (
    "id" TEXT NOT NULL,
    "merchant" TEXT NOT NULL,
    "amount" DOUBLE PRECISION,
    "category" TEXT NOT NULL,
    "note" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,

    CONSTRAINT "MerchantRule_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "MerchantRule_userId_merchant_idx" ON "MerchantRule"("userId", "merchant");

-- AddForeignKey
ALTER TABLE "MerchantRule" ADD CONSTRAINT "MerchantRule_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
