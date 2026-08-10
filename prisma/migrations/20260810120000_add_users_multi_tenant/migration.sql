-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_token_key" ON "User"("token");

-- Seed the owner account (keeps all pre-existing data below) and one guest
-- account with no data yet. Both tokens are shared out of band as
-- /enter/<token> links; they are not secrets checked into application code
-- beyond this one-time migration.
INSERT INTO "User" ("id", "name", "token") VALUES
    ('u_7fe991907e98486c9b22d86f11725eb0', 'רועי', 'afaf81e7-9723-4733-9e17-0728003090f3'),
    ('u_4bc01de4ff03457187deeac40741a3b1', 'אח', 'e8f202f4-4708-43aa-a829-821bf574aa14');

-- AddColumn (nullable first so existing rows can be backfilled)
ALTER TABLE "Transaction" ADD COLUMN "userId" TEXT;
ALTER TABLE "Subscription" ADD COLUMN "userId" TEXT;
ALTER TABLE "Shift" ADD COLUMN "userId" TEXT;
ALTER TABLE "SalarySettings" ADD COLUMN "userId" TEXT;

-- Backfill: all data that existed before multi-user support belongs to the owner.
UPDATE "Transaction" SET "userId" = 'u_7fe991907e98486c9b22d86f11725eb0' WHERE "userId" IS NULL;
UPDATE "Subscription" SET "userId" = 'u_7fe991907e98486c9b22d86f11725eb0' WHERE "userId" IS NULL;
UPDATE "Shift" SET "userId" = 'u_7fe991907e98486c9b22d86f11725eb0' WHERE "userId" IS NULL;
UPDATE "SalarySettings" SET "userId" = 'u_7fe991907e98486c9b22d86f11725eb0' WHERE "userId" IS NULL;

-- Now that every row has an owner, enforce it going forward.
ALTER TABLE "Transaction" ALTER COLUMN "userId" SET NOT NULL;
ALTER TABLE "Subscription" ALTER COLUMN "userId" SET NOT NULL;
ALTER TABLE "Shift" ALTER COLUMN "userId" SET NOT NULL;
ALTER TABLE "SalarySettings" ALTER COLUMN "userId" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Shift" ADD CONSTRAINT "Shift_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "SalarySettings" ADD CONSTRAINT "SalarySettings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateIndex
CREATE INDEX "Transaction_userId_idx" ON "Transaction"("userId");
CREATE INDEX "Subscription_userId_idx" ON "Subscription"("userId");
CREATE INDEX "Shift_userId_idx" ON "Shift"("userId");
CREATE INDEX "SalarySettings_userId_idx" ON "SalarySettings"("userId");

-- Replace the (month, year) unique constraint with (userId, month, year)
-- so two users can each have their own settings for the same month.
DROP INDEX "SalarySettings_month_year_key";
CREATE UNIQUE INDEX "SalarySettings_userId_month_year_key" ON "SalarySettings"("userId", "month", "year");
