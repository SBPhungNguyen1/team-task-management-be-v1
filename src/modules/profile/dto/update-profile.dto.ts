import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MaxLength } from 'class-validator';

export class UpdateProfileDto {
  @IsString()
  @IsEmail()
  @MaxLength(50)
  @ApiProperty({ example: 'a@example.com' })
  email?: string;

  @IsString()
  @ApiProperty({ example: 'A James' })
  name?: string;
}
