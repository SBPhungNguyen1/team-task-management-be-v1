import {
  Controller,
  Get,
  Body,
  Patch,
  Param,
  Delete,
  Post,
  Query,
} from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { UpdateProjectDto } from './dto/update-project.dto';
import { ApiBearerAuth } from '@nestjs/swagger';
import { QueryTaskDto } from '../tasks/dto/query-task.dto';
import { CreateTaskDto } from '../tasks/dto/create-task.dto';
import { Roles } from 'src/common/decorators/role.decorator';
import { RoleEnum } from 'src/common/enums/roles.enum';

@Controller('projects')
@ApiBearerAuth()
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.projectsService.findOne(id);
  }

  @Patch(':id')
  @Roles(RoleEnum.SUPER_ADMIN, RoleEnum.ADMIN)
  update(@Param('id') id: string, @Body() updateProjectDto: UpdateProjectDto) {
    return this.projectsService.update(id, updateProjectDto);
  }

  @Delete(':id')
  @Roles(RoleEnum.SUPER_ADMIN, RoleEnum.ADMIN)
  remove(@Param('id') id: string) {
    return this.projectsService.remove(id);
  }

  @Get(':id/tasks')
  listTask(@Param('id') id: string, @Query() query: QueryTaskDto) {
    return this.projectsService.listTask(id, query);
  }

  @Post(':id/tasks')
  createTask(@Param('id') id: string, @Body() createTaskDto: CreateTaskDto) {
    return this.projectsService.createTask(id, createTaskDto);
  }
}
