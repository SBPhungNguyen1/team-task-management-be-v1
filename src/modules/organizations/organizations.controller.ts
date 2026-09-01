import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { OrganizationsService } from './organizations.service';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { UpdateOrganizationDto } from './dto/update-organization.dto';
import { QueryOrganizationDto } from './dto/query-organization.dto';
import { ApiBearerAuth } from '@nestjs/swagger';
import { Roles } from 'src/common/decorators/role.decorator';
import { RoleEnum } from 'src/common/enums/roles.enum';
import { CreateProjectDto } from '../projects/dto/create-project.dto';
import { QueryProjectDto } from '../projects/dto/query-project.dto';

@Controller('organizations')
@ApiBearerAuth()
export class OrganizationsController {
  constructor(private readonly organizationsService: OrganizationsService) {}

  @Post()
  @Roles(RoleEnum.SUPER_ADMIN)
  create(@Body() createOrganizationDto: CreateOrganizationDto) {
    return this.organizationsService.create(createOrganizationDto);
  }

  @Get()
  findAll(@Query() query: QueryOrganizationDto) {
    return this.organizationsService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.organizationsService.findOne(id);
  }

  @Patch(':id')
  @Roles(RoleEnum.SUPER_ADMIN)
  update(
    @Param('id') id: string,
    @Body() updateOrganizationDto: UpdateOrganizationDto,
  ) {
    return this.organizationsService.update(id, updateOrganizationDto);
  }

  @Delete(':id')
  @Roles(RoleEnum.SUPER_ADMIN)
  remove(@Param('id') id: string) {
    return this.organizationsService.remove(id);
  }

  @Post(':id/member')
  @Roles(RoleEnum.SUPER_ADMIN, RoleEnum.ADMIN)
  addMember(@Param('id') id: string, @Body() ids: string[]) {
    return this.organizationsService.addMember(id, ids);
  }

  @Post(':id/projects')
  @Roles(RoleEnum.SUPER_ADMIN, RoleEnum.ADMIN)
  addProject(
    @Param('id') id: string,
    @Body() createProjectDto: CreateProjectDto,
  ) {
    return this.organizationsService.addProject(id, createProjectDto);
  }

  @Get(':id/projects')
  listProject(@Param('id') id: string, @Query() query: QueryProjectDto) {
    return this.organizationsService.listProject(id, query);
  }
}
