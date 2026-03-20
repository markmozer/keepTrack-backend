-- CreateEnum
CREATE TYPE "TenantType" AS ENUM ('BASE', 'CLIENT', 'DEMO');

-- AlterTable
ALTER TABLE "Tenant" ADD COLUMN     "type" "TenantType";
