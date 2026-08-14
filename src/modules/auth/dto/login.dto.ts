import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ example: 'budi@example.com', description: 'Registered email' })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: 'secret123', description: 'Account password' })
  @IsString()
  @IsNotEmpty()
  password!: string;
}
