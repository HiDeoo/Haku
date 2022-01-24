/*
  Warnings:

  - You are about to drop the column `rootNodes` on the `Todo` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Todo" DROP COLUMN "rootNodes",
ADD COLUMN     "root" TEXT[];
