-- DropForeignKey
ALTER TABLE "public"."orders_lines" DROP CONSTRAINT "orders_lines_order_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."orders_lines" DROP CONSTRAINT "orders_lines_session_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."sessions" DROP CONSTRAINT "sessions_activity_id_fkey";

-- AddForeignKey
ALTER TABLE "public"."sessions" ADD CONSTRAINT "sessions_activity_id_fkey" FOREIGN KEY ("activity_id") REFERENCES "public"."activities"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."orders_lines" ADD CONSTRAINT "orders_lines_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."orders_lines" ADD CONSTRAINT "orders_lines_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "public"."sessions"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
