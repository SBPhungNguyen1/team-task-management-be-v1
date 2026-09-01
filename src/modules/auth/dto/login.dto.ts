import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class LoginDto {
  @ApiProperty({ example: 'admin@example.com' })
  @IsString()
  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @ApiProperty({ example: '123' })
  @IsString()
  @IsNotEmpty()
  password!: string;

  @ApiProperty({ example: '' })
  @IsString()
  @IsNotEmpty()
  user_agent!: string;

  @ApiProperty({ example: '' })
  @IsString()
  @IsNotEmpty()
  ip_address!: string;
}
