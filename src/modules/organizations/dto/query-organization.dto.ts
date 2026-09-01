import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { BaseListDto } from 'src/common/base/dto/base-list.dto';

export class QueryOrganizationDto extends BaseListDto {
  @IsString()
  @IsOptional()
  @ApiPropertyOptional()
  name!: string;
}
