import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class RefreshDto {
  @ApiProperty({ example: '' })
  @IsString()
  @IsNotEmpty()
  refresh_token!: string;

  @ApiProperty({ example: 'abc' })
  @IsString()
  @IsNotEmpty()
  user_agent!: string;

  @ApiProperty({ example: '192.168.1.1' })
  @IsString()
  @IsNotEmpty()
  ip_address!: string;
}
