/*
  Warnings:

  - Made the column `number` on table `Table` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Table" ALTER COLUMN "number" SET NOT NULL;
