import { ApiProperty } from '@nestjs/swagger';
import { IsString, MaxLength, MinLength } from 'class-validator';
export class CreateUserDto {
  @IsString()
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
}
