-- DropForeignKey
ALTER TABLE "public"."orders_lines" DROP CONSTRAINT "orders_lines_order_id_fkey";

-- AddForeignKey
ALTER TABLE "public"."orders_lines" ADD CONSTRAINT "orders_lines_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
