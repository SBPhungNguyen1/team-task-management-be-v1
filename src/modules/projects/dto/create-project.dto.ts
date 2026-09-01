import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateProjectDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: 'project-1' })
  name!: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: 'project-1 description' })
  description!: string;
}
