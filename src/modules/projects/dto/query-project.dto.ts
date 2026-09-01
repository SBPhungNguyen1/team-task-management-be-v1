import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { BaseListDto } from 'src/common/base/dto/base-list.dto';

export class QueryProjectDto extends BaseListDto {
  @IsString()
  @IsOptional()
  @ApiPropertyOptional()
  name!: string;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional()
  description!: string;
}
