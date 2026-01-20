/*
  Warnings:

  - Added the required column `duration` to the `Clip` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Clip" ADD COLUMN     "duration" INTEGER NOT NULL;
