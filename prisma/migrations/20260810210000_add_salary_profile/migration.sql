-- AddColumn: personal salary profile per user. Defaults match the values
-- every account used before this migration (regularRate/shabbatRate/
-- monthlyBonus/travelAllowance/overtimeEnabled), so existing salary numbers
-- are unaffected until someone changes their own settings.
ALTER TABLE "User" ADD COLUMN "regularRate" DOUBLE PRECISION NOT NULL DEFAULT 69.47;
ALTER TABLE "User" ADD COLUMN "shabbatRate" DOUBLE PRECISION NOT NULL DEFAULT 96;
ALTER TABLE "User" ADD COLUMN "overtimeEnabled" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "User" ADD COLUMN "monthlyBonus" DOUBLE PRECISION NOT NULL DEFAULT 2000;
ALTER TABLE "User" ADD COLUMN "travelAllowance" DOUBLE PRECISION NOT NULL DEFAULT 236;

-- The guest account (the brother) is paid differently: overtime applies to
-- his job, and he has no fixed monthly bonus. His hourly rate still needs
-- to be set for real via the in-app salary settings.
UPDATE "User" SET "overtimeEnabled" = true, "monthlyBonus" = 0
WHERE "id" = 'u_4bc01de4ff03457187deeac40741a3b1';
