-- DropForeignKey
ALTER TABLE "public"."orders_lines" DROP CONSTRAINT "orders_lines_session_id_fkey";

-- AddForeignKey
ALTER TABLE "public"."orders_lines" ADD CONSTRAINT "orders_lines_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "public"."sessions"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
