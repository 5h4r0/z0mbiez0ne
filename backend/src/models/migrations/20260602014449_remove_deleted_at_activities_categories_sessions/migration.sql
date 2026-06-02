/*
  Warnings:

  - You are about to drop the column `deleted_at` on the `activities` table. All the data in the column will be lost.
  - You are about to drop the column `deleted_at` on the `categories` table. All the data in the column will be lost.
  - You are about to drop the column `deleted_at` on the `sessions` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "activities" DROP COLUMN "deleted_at";

-- AlterTable
ALTER TABLE "categories" DROP COLUMN "deleted_at";

-- AlterTable
ALTER TABLE "sessions" DROP COLUMN "deleted_at";
