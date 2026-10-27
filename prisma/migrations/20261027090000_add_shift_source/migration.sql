-- AlterTable
ALTER TABLE "Shift" ADD COLUMN     "externalId" TEXT,
ADD COLUMN     "source" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Shift_userId_source_externalId_key" ON "Shift"("userId", "source", "externalId");
