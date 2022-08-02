/*
  Warnings:

  - The primary key for the `users_clinics` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `users_clinics` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "users_clinics" DROP CONSTRAINT "users_clinics_pkey",
DROP COLUMN "id",
ADD CONSTRAINT "users_clinics_pkey" PRIMARY KEY ("user_id", "clinic_id");
