import { Controller, Get, Body, Patch, Param, Delete } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { UpdateTaskDto } from './dto/update-task.dto';
import { ApiBearerAuth } from '@nestjs/swagger';
import { Roles } from 'src/common/decorators/role.decorator';
import { RoleEnum } from 'src/common/enums/roles.enum';
import { UpdateTaskStatusDto } from './dto/update-task-status.dto';

@Controller('tasks')
@ApiBearerAuth()
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.tasksService.findOne(id);
  }

  @Patch(':id/status')
  updateStatus(
    @Param('id') id: string,
    @Body() updateTaskStatusDto: UpdateTaskStatusDto,
  ) {
    return this.tasksService.updateStatus(id, updateTaskStatusDto);
  }

  @Patch(':id')
  @Roles(RoleEnum.SUPER_ADMIN, RoleEnum.ADMIN)
  update(@Param('id') id: string, @Body() updateTaskDto: UpdateTaskDto) {
    return this.tasksService.update(id, updateTaskDto);
  }

  @Delete(':id')
  @Roles(RoleEnum.SUPER_ADMIN, RoleEnum.ADMIN)
  remove(@Param('id') id: string) {
    return this.tasksService.remove(id);
  }
}
