import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsNotEmpty, IsString } from 'class-validator';
import { TaskStatus } from 'src/common/enums/task-status.enum';

export class UpdateTaskStatusDto {
  @IsString()
  @IsNotEmpty()
  @IsIn(Object.values(TaskStatus))
  @ApiProperty({ example: TaskStatus.IN_PROGRESS })
  status!: TaskStatus;
}
