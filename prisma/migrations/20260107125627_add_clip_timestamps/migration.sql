/*
  Warnings:

  - Added the required column `endTime` to the `Clip` table without a default value. This is not possible if the table is not empty.
  - Added the required column `startTime` to the `Clip` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Clip" ADD COLUMN     "endTime" INTEGER NOT NULL,
ADD COLUMN     "startTime" INTEGER NOT NULL;
