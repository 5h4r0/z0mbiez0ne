-- AlterTable
ALTER TABLE "public"."orders" ALTER COLUMN "total_amount" SET DATA TYPE DECIMAL(5,2);

-- AlterTable
ALTER TABLE "public"."orders_lines" ALTER COLUMN "amount" SET DATA TYPE DECIMAL(5,2);

-- AlterTable
ALTER TABLE "public"."sessions" ALTER COLUMN "unit_price" SET DATA TYPE DECIMAL(4,2);
