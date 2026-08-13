import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class CreateUserDto {
  /**
   * Full name of the user
   * @example "Budi Santoso"
   */
  @IsString()
  @IsNotEmpty()
  name!: string;

  /**
   * Unique email address, used for login
   * @example "budi@example.com"
   */
  @IsEmail()
  email!: string;

  /**
   * Account password (min. 6 characters)
   * @example "secret123"
   */
  @IsString()
  @MinLength(6)
  password!: string;
}
