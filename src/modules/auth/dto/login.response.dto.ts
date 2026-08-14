import { ApiProperty } from '@nestjs/swagger';

import { UserRole } from '#app/generated/prisma/enums.js';

export class AuthUserDto {
  @ApiProperty({ example: 1 })
  id!: number;

  @ApiProperty({ example: 'Budi Santoso' })
  name!: string;

  @ApiProperty({ example: 'budi@example.com' })
  email!: string;

  @ApiProperty({ enum: UserRole, example: UserRole.CUSTOMER })
  role!: UserRole;
}

export class LoginResponseDto {
  @ApiProperty({
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    description: 'JWT access token to send as a Bearer token',
  })
  accessToken!: string;

  @ApiProperty({ type: () => AuthUserDto, description: 'Authenticated user' })
  user!: AuthUserDto;
}
