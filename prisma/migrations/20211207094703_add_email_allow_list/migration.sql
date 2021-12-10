-- CreateTable
CREATE TABLE "EmailAllowList" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,

    CONSTRAINT "EmailAllowList_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "EmailAllowList_email_key" ON "EmailAllowList"("email");
