/*
  Warnings:

  - A unique constraint covering the columns `[tenantId,userId,roleId]` on the table `UserRole` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "UserRole_tenantId_userId_roleId_validFrom_key";

-- CreateIndex
CREATE UNIQUE INDEX "UserRole_tenantId_userId_roleId_key" ON "UserRole"("tenantId", "userId", "roleId");
