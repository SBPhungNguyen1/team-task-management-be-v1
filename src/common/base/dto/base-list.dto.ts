import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsInt, IsString, Min } from 'class-validator';

export class BaseListDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  @Min(1)
  page!: number;

  @ApiProperty({ example: 10 })
  @IsInt()
  @Min(-1)
  limit!: number;

  @ApiProperty({ example: 'created_at' })
  @IsString()
  sort_by!: string;

  @ApiProperty({ example: 'DESC' })
  @IsString()
  @IsIn(['ASC', 'DESC'])
  sort_order!: string;
}
