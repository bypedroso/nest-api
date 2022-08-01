/*
  Warnings:

  - Added the required column `responsible_user_id` to the `clinics` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "clinics" ADD COLUMN     "responsible_user_id" VARCHAR(255) NOT NULL;
