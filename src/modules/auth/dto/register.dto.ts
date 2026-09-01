import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsIn,
  IsNotEmpty,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class RegisterDto {
  @IsString()
  @IsEmail()
  @MaxLength(50)
  @ApiProperty({ example: 'a@example.com' })
  email!: string;

  @IsString()
  @MinLength(3)
  @MaxLength(50)
  @ApiProperty({ example: '123' })
  password!: string;

  @IsString()
  @MinLength(3)
  @MaxLength(50)
  @ApiProperty({ example: '123' })
  confirm_password!: string;

  @IsString()
  @ApiProperty({ example: 'A James' })
  @IsNotEmpty()
  name!: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: 'ADMIN' })
  @IsIn(['SUPER_ADMIN', 'ADMIN', 'MEMBER'])
  role!: string;
}
