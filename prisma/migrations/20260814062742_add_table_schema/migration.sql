-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "tableId" INTEGER;

-- CreateTable
CREATE TABLE "Table" (
    "id" SERIAL NOT NULL,
    "code" TEXT NOT NULL,
    "number" INTEGER,
    "name" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Table_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Table_code_key" ON "Table"("code");

-- CreateIndex
CREATE UNIQUE INDEX "Table_number_key" ON "Table"("number");

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_tableId_fkey" FOREIGN KEY ("tableId") REFERENCES "Table"("id") ON DELETE SET NULL ON UPDATE CASCADE;
