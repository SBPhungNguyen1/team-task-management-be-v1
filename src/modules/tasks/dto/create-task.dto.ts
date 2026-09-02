import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsNotEmpty, IsString } from 'class-validator';
import { TaskPriority } from 'src/common/enums/task-priority.enum';
import { TaskStatus } from 'src/common/enums/task-status.enum';

export class CreateTaskDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: 'task-1-a' })
  title!: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: 'task-1-a description' })
  description!: TaskStatus;

  @IsString()
  @IsNotEmpty()
  @IsIn(Object.values(TaskStatus))
  @ApiProperty({ example: TaskStatus.TODO })
  status!: TaskStatus;

  @IsString()
  @IsNotEmpty()
  @IsIn(Object.values(TaskStatus))
  @ApiProperty({ example: TaskPriority.LOW })
  priority!: TaskPriority;
}
