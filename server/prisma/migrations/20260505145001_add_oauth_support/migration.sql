-- AlterTable
ALTER TABLE "public"."users" ADD COLUMN     "authProvider" TEXT NOT NULL DEFAULT 'credentials',
ALTER COLUMN "passwordHash" DROP NOT NULL,
ALTER COLUMN "salt" DROP NOT NULL;
