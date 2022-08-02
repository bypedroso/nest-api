/*
  Warnings:

  - The primary key for the `users_clinics` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The required column `id` was added to the `users_clinics` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.

*/
-- AlterTable
ALTER TABLE "users_clinics" DROP CONSTRAINT "users_clinics_pkey",
ADD COLUMN     "id" TEXT NOT NULL,
ADD CONSTRAINT "users_clinics_pkey" PRIMARY KEY ("id");
