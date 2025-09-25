-- DropForeignKey
ALTER TABLE "public"."activities_categories" DROP CONSTRAINT "activities_categories_activity_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."activities_categories" DROP CONSTRAINT "activities_categories_category_id_fkey";

-- AddForeignKey
ALTER TABLE "public"."activities_categories" ADD CONSTRAINT "activities_categories_activity_id_fkey" FOREIGN KEY ("activity_id") REFERENCES "public"."activities"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."activities_categories" ADD CONSTRAINT "activities_categories_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
