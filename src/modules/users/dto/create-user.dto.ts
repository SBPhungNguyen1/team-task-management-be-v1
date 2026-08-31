import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsIn, IsString, MaxLength, MinLength } from 'class-validator';
export class CreateUserDto {
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
  @ApiProperty({ example: 'A James' })
  name!: string;

  @IsString()
  @ApiProperty({ example: 'ADMIN' })
  @IsIn(['SUPER_ADMIN', 'ADMIN', 'MEMBER'])
  role!: string;
}
