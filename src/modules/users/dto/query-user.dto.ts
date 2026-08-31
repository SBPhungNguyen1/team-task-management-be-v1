import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString } from 'class-validator';
import { BaseListDto } from 'src/common/base/dto/base-list.dto';

export class QueryUserDto extends BaseListDto {
  @ApiPropertyOptional()
  @IsString()
  email?: string;

  @ApiPropertyOptional()
  @IsString()
  name?: string;
}
