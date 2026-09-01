import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class ChangePasswordDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @ApiProperty({ example: '123' })
  current_password!: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @ApiProperty({ example: '1234' })
  new_password!: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @ApiProperty({ example: '1234' })
  confirm_new_password!: string;
}
