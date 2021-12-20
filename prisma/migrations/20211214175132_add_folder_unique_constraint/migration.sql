/*
  Warnings:

  - A unique constraint covering the columns `[parentId,type,userId,name]` on the table `Folder` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Folder_parentId_type_userId_name_unique_constraint" ON "Folder"("parentId", "type", "userId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "Folder_parentId_type_userId_name_unique_constraint_with_null_parentId" ON "Folder"("type", "userId", "name") WHERE "parentId" IS NULL;
