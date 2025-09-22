/*
  Warnings:

  - You are about to alter the column `title` on the `activities` table. The data in that column could be lost. The data in that column will be cast from `VarChar(255)` to `VarChar(120)`.
  - The primary key for the `activities_categories` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `activities_id` on the `activities_categories` table. All the data in the column will be lost.
  - You are about to drop the column `categories_id` on the `activities_categories` table. All the data in the column will be lost.
  - You are about to drop the column `users_id` on the `orders` table. All the data in the column will be lost.
  - You are about to drop the column `orders_id` on the `orders_lines` table. All the data in the column will be lost.
  - You are about to drop the column `sessions_id` on the `orders_lines` table. All the data in the column will be lost.
  - You are about to alter the column `amount` on the `orders_lines` table. The data in that column could be lost. The data in that column will be cast from `Decimal(5,2)` to `Decimal(4,2)`.
  - You are about to drop the column `roles_id` on the `users` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[order_id,session_id]` on the table `orders_lines` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `slug` to the `activities` table without a default value. This is not possible if the table is not empty.
  - Added the required column `activity_id` to the `activities_categories` table without a default value. This is not possible if the table is not empty.
  - Added the required column `category_id` to the `activities_categories` table without a default value. This is not possible if the table is not empty.
  - Added the required column `slug` to the `categories` table without a default value. This is not possible if the table is not empty.
  - Added the required column `user_id` to the `orders` table without a default value. This is not possible if the table is not empty.
  - Added the required column `order_id` to the `orders_lines` table without a default value. This is not possible if the table is not empty.
  - Added the required column `session_id` to the `orders_lines` table without a default value. This is not possible if the table is not empty.
  - Added the required column `activity_id` to the `sessions` table without a default value. This is not possible if the table is not empty.
  - Added the required column `role_id` to the `users` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."activities_categories" DROP CONSTRAINT "activities_categories_activities_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."activities_categories" DROP CONSTRAINT "activities_categories_categories_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."orders" DROP CONSTRAINT "orders_users_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."orders_lines" DROP CONSTRAINT "orders_lines_orders_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."orders_lines" DROP CONSTRAINT "orders_lines_sessions_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."users" DROP CONSTRAINT "users_roles_id_fkey";

-- DropIndex
DROP INDEX "public"."orders_sessions";

-- AlterTable
ALTER TABLE "public"."activities" ADD COLUMN     "slug" VARCHAR(120) NOT NULL,
ALTER COLUMN "title" SET DATA TYPE VARCHAR(120),
ALTER COLUMN "updated_at" SET DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "public"."activities_categories" DROP CONSTRAINT "activities_categories_pkey",
DROP COLUMN "activities_id",
DROP COLUMN "categories_id",
ADD COLUMN     "activity_id" INTEGER NOT NULL,
ADD COLUMN     "category_id" INTEGER NOT NULL,
ADD CONSTRAINT "activities_categories_pkey" PRIMARY KEY ("activity_id", "category_id");

-- AlterTable
ALTER TABLE "public"."categories" ADD COLUMN     "slug" VARCHAR(120) NOT NULL,
ALTER COLUMN "title" SET DATA TYPE VARCHAR(120),
ALTER COLUMN "updated_at" SET DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "public"."orders" DROP COLUMN "users_id",
ADD COLUMN     "user_id" INTEGER NOT NULL,
ALTER COLUMN "taxes" SET DATA TYPE DECIMAL(4,2),
ALTER COLUMN "updated_at" SET DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "public"."orders_lines" DROP COLUMN "orders_id",
DROP COLUMN "sessions_id",
ADD COLUMN     "order_id" INTEGER NOT NULL,
ADD COLUMN     "session_id" INTEGER NOT NULL,
ALTER COLUMN "amount" SET DATA TYPE DECIMAL(4,2),
ALTER COLUMN "updated_at" SET DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "public"."sessions" ADD COLUMN     "activity_id" INTEGER NOT NULL,
ALTER COLUMN "unit_price" SET DATA TYPE DECIMAL(5,2),
ALTER COLUMN "updated_at" SET DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "public"."users" DROP COLUMN "roles_id",
ADD COLUMN     "role_id" INTEGER NOT NULL,
ALTER COLUMN "updated_at" SET DEFAULT CURRENT_TIMESTAMP;

-- CreateIndex
CREATE UNIQUE INDEX "order_session" ON "public"."orders_lines"("order_id", "session_id");

-- CreateIndex
CREATE INDEX "idx_session_activity_id" ON "public"."sessions"("activity_id");

-- AddForeignKey
ALTER TABLE "public"."users" ADD CONSTRAINT "users_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "public"."roles"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."activities_categories" ADD CONSTRAINT "activities_categories_activity_id_fkey" FOREIGN KEY ("activity_id") REFERENCES "public"."activities"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."activities_categories" ADD CONSTRAINT "activities_categories_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."sessions" ADD CONSTRAINT "sessions_activity_id_fkey" FOREIGN KEY ("activity_id") REFERENCES "public"."activities"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."orders" ADD CONSTRAINT "orders_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."orders_lines" ADD CONSTRAINT "orders_lines_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."orders_lines" ADD CONSTRAINT "orders_lines_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "public"."sessions"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
