import { IsNotEmpty, IsString } from 'class-validator';

export class CreateClinicDto {
  /**
   * The CNPJ from the clinic.
   * @example "00.000.000/0001-00"
   */
  @IsNotEmpty()
  @IsString()
  cnpj: string;

  /**
   * The name from the clinic.
   * @example "Name Surname"
   */
  @IsNotEmpty()
  @IsString()
  name: string;

  /**
   * The id responsabile for clinic.
   * @example "Clinica Teste"
   */
  @IsNotEmpty()
  @IsString()
  responsible_user_id: string;
}
