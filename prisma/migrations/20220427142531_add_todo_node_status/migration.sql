/*
  Warnings:

  - You are about to drop the column `completed` on the `TodoNode` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "TodoNodeStatus" AS ENUM ('ACTIVE', 'CANCELLED', 'COMPLETED');

-- AlterTable
ALTER TABLE "TodoNode" DROP COLUMN "completed",
ADD COLUMN     "status" "TodoNodeStatus" NOT NULL DEFAULT E'ACTIVE';
