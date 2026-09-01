import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class RefreshDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  refresh_token!: string;

  @ApiProperty({ example: '' })
  @IsString()
  @IsNotEmpty()
  user_agent!: string;

  @ApiProperty({ example: '' })
  @IsString()
  @IsNotEmpty()
  ip_address!: string;
}
