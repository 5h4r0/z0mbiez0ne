-- AlterTable refresh_token: replace `token` with `token_id` + `token_hash`
ALTER TABLE "refresh_token" DROP COLUMN IF EXISTS "token";
ALTER TABLE "refresh_token" ADD COLUMN "token_id" VARCHAR(64);
ALTER TABLE "refresh_token" ADD COLUMN "token_hash" TEXT;

-- Make non-nullable (table is empty after db:reset)
ALTER TABLE "refresh_token" ALTER COLUMN "token_id" SET NOT NULL;
ALTER TABLE "refresh_token" ALTER COLUMN "token_hash" SET NOT NULL;

-- CreateUniqueIndex
CREATE UNIQUE INDEX "refresh_token_token_id_key" ON "refresh_token"("token_id");

-- CreateUniqueIndex on activities.slug and categories.slug if not exists
CREATE UNIQUE INDEX IF NOT EXISTS "activities_slug_key" ON "activities"("slug");
CREATE UNIQUE INDEX IF NOT EXISTS "categories_slug_key" ON "categories"("slug");
