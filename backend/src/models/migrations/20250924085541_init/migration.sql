-- DropForeignKey
ALTER TABLE "public"."sessions" DROP CONSTRAINT "sessions_activity_id_fkey";

-- AddForeignKey
ALTER TABLE "public"."sessions" ADD CONSTRAINT "sessions_activity_id_fkey" FOREIGN KEY ("activity_id") REFERENCES "public"."activities"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
