-- CreateTable
CREATE TABLE "SalarySettings" (
    "id" TEXT NOT NULL,
    "month" INTEGER NOT NULL,
    "year" INTEGER NOT NULL,
    "referralCount" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "SalarySettings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SalarySettings_month_year_key" ON "SalarySettings"("month", "year");
