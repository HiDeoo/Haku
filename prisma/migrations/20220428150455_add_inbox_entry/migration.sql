-- AlterTable
ALTER TABLE "User" ADD COLUMN     "inboxToken" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "InboxEntry" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "text" TEXT NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "InboxEntry_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "InboxEntry" ADD CONSTRAINT "InboxEntry_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
