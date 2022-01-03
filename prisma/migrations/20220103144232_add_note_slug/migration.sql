/*
  Warnings:

  - Added the required column `slug` to the `Note` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Note" ADD COLUMN     "slug" TEXT NOT NULL;
