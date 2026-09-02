import { Controller, Get, Body, Patch, Param, Delete } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { UpdateTaskDto } from './dto/update-task.dto';
import { ApiBearerAuth } from '@nestjs/swagger';

@Controller('tasks')
@ApiBearerAuth()
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.tasksService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateTaskDto: UpdateTaskDto) {
    return this.tasksService.update(id, updateTaskDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.tasksService.remove(id);
  }
}
