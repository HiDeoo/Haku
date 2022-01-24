-- CreateTable
CREATE TABLE "TodoNode" (
    "id" SERIAL NOT NULL,
    "content" TEXT NOT NULL,
    "todoId" INTEGER,

    CONSTRAINT "TodoNode_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "TodoNode" ADD CONSTRAINT "TodoNode_todoId_fkey" FOREIGN KEY ("todoId") REFERENCES "Todo"("id") ON DELETE SET NULL ON UPDATE CASCADE;
