/*
  Warnings:

  - You are about to drop the column `note` on the `TodoNode` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "TodoNode" DROP COLUMN "note",
ADD COLUMN     "noteHtml" TEXT,
ADD COLUMN     "noteText" TEXT;
