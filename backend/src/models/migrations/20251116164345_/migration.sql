/*
  Warnings:

  - A unique constraint covering the columns `[slug]` on the table `activities` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "activities_slug_key" ON "activities"("slug");
