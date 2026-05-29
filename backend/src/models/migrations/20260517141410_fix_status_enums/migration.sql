/*
  Warnings:

  - Made the column `user_id` on table `orders` required. This step will fail if there are existing NULL values in that column.
  - Changed the type of `status` on the `orders` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `status` on the `sessions` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "OrderStatus" AS ENUM ('Pending', 'Confirmed', 'Cancelled', 'Refunded');

-- CreateEnum
CREATE TYPE "SessionStatus" AS ENUM ('Scheduled', 'Cancelled', 'Completed');

-- AlterTable orders: user_id NOT NULL
ALTER TABLE "orders" ALTER COLUMN "user_id" SET NOT NULL;

-- AlterTable orders: cast status VARCHAR -> enum
ALTER TABLE "orders" ALTER COLUMN "status" TYPE "OrderStatus" USING "status"::"OrderStatus";

-- AlterTable orders_lines
ALTER TABLE "orders_lines" ALTER COLUMN "amount" SET DATA TYPE DECIMAL(5,2);

-- AlterTable sessions: cast status VARCHAR -> enum
ALTER TABLE "sessions" ALTER COLUMN "status" TYPE "SessionStatus" USING "status"::"SessionStatus";
