import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional, IsString } from 'class-validator';
import { BaseListDto } from 'src/common/base/dto/base-list.dto';
import { TaskPriority } from 'src/common/enums/task-priority.enum';
import { TaskStatus } from 'src/common/enums/task-status.enum';

export class QueryTaskDto extends BaseListDto {
  @IsString()
  @IsOptional()
  @ApiPropertyOptional()
  name?: string;

  @IsString()
  @IsOptional()
  @IsIn(Object.values(TaskStatus))
  @ApiPropertyOptional()
  status?: string;

  @IsString()
  @IsOptional()
  @IsIn(Object.values(TaskPriority))
  @ApiPropertyOptional()
  priority?: string;
}
