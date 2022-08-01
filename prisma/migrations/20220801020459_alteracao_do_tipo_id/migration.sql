/*
  Warnings:

  - The primary key for the `forgot_passwords` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `users` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `email` on the `users` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(255)`.
  - A unique constraint covering the columns `[email]` on the table `forgot_passwords` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "forgot_passwords" DROP CONSTRAINT "forgot_passwords_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "forgot_passwords_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "forgot_passwords_id_seq";

-- AlterTable
ALTER TABLE "users" DROP CONSTRAINT "users_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "email" SET DATA TYPE VARCHAR(255),
ADD CONSTRAINT "users_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "users_id_seq";

-- CreateIndex
CREATE UNIQUE INDEX "forgot_passwords_email_key" ON "forgot_passwords"("email");
