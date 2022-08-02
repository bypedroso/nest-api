/*
  Warnings:

  - Added the required column `isAdmin` to the `users_clinics` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "users_clinics" ADD COLUMN     "isAdmin" BOOLEAN NOT NULL;
