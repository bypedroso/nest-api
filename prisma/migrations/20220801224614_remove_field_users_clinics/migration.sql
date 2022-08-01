/*
  Warnings:

  - You are about to drop the column `cnpj` on the `users_clinics` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `users_clinics` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "users_clinics_cnpj_key";

-- AlterTable
ALTER TABLE "users_clinics" DROP COLUMN "cnpj",
DROP COLUMN "name";
