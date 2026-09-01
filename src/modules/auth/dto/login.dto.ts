import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class LoginDto {
  @ApiProperty({ example: 'spadmin@example.com' })
  @IsString()
  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @ApiProperty({ example: '123' })
  @IsString()
  @IsNotEmpty()
  password!: string;

  @ApiProperty({ example: 'abc' })
  @IsString()
  @IsNotEmpty()
  user_agent!: string;

  @ApiProperty({ example: '192.168.1.1' })
  @IsString()
  @IsNotEmpty()
  ip_address!: string;
}
