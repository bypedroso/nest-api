-- DropForeignKey
ALTER TABLE "users_clinics" DROP CONSTRAINT "users_clinics_clinic_id_fkey";

-- DropForeignKey
ALTER TABLE "users_clinics" DROP CONSTRAINT "users_clinics_user_id_fkey";

-- AlterTable
ALTER TABLE "users_clinics" ALTER COLUMN "user_id" DROP NOT NULL,
ALTER COLUMN "clinic_id" DROP NOT NULL,
ALTER COLUMN "isAdmin" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "users_clinics" ADD CONSTRAINT "users_clinics_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users_clinics" ADD CONSTRAINT "users_clinics_clinic_id_fkey" FOREIGN KEY ("clinic_id") REFERENCES "clinics"("id") ON DELETE SET NULL ON UPDATE CASCADE;
