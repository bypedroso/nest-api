import { IsNotEmpty, IsString } from 'class-validator';

export class CreateClinicaDto {
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
  nome: string;
}
