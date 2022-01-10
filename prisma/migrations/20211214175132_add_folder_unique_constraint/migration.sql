-- CreateIndex
CREATE UNIQUE INDEX "Folder_parentId_type_userId_name_unique_constraint" ON "Folder"("parentId", "type", "userId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "Folder_parentId_type_userId_name_unique_constraint_with_null_parentId" ON "Folder"("type", "userId", "name") WHERE "parentId" IS NULL;
