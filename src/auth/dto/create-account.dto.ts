import { IsNotEmpty, IsString } from 'class-validator';

export class CreateAccountDto {
  /**
   * The name address from the user.
   * @example "Name Surname"
   */
  @IsNotEmpty()
  @IsString()
  name: string;

  /**
   * The email from the user.
   * @example "email@email.com"
   */
  @IsNotEmpty()
  @IsString()
  email: string;

  /**
   * The password from the user.
   * @example "Password@123"
   */
  @IsNotEmpty()
  @IsString()
  password: string;

  /**
   * The CNPJ clinic from the user.
   * @example "00.000.000/0001-00"
   */
  @IsNotEmpty()
  @IsString()
  clinica_cnpj: string;

  /**
   * The name clinic from the user.
   * @example "Clinica Teste"
   */
  @IsNotEmpty()
  @IsString()
  clinica_name: string;
}
