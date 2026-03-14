/*
  Warnings:

  - You are about to drop the column `inviteToken` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "inviteToken",
ADD COLUMN     "inviteTokenHash" TEXT;
