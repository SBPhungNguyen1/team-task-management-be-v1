import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString } from 'class-validator';

export class LoginDto {
  @ApiProperty({ example: 'admin@example.com' })
  @IsString()
  @IsEmail()
  email!: string;

  @ApiProperty({ example: '123' })
  @IsString()
  password!: string;

  @ApiProperty({ example: '' })
  @IsString()
  user_agent!: string;

  @ApiProperty({ example: '' })
  @IsString()
  ip_address!: string;
}
