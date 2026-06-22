-- AlterTable
ALTER TABLE "Shift" ALTER COLUMN "regularHours" SET NOT NULL;
ALTER TABLE "Shift" ALTER COLUMN "shabbatHours" SET NOT NULL;
ALTER TABLE "Shift" DROP COLUMN "isShabbat";
