import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UpdateProjectDto } from './dto/update-project.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { ProjectEntity } from './entities/project.entity';
import { Not, Repository } from 'typeorm';

@Injectable()
export class ProjectsService {
  constructor(
    @InjectRepository(ProjectEntity)
    private readonly projectRepo: Repository<ProjectEntity>,
  ) {}

  async findOne(id: string) {
    const item = await this.projectRepo.findOne({
      where: { id },
      relations: {
        organization: true,
      },
    });
    if (!item) throw new NotFoundException('Project not found');

    return item;
  }

  async update(id: string, updateProjectDto: UpdateProjectDto) {
    const item = await this.findOne(id);

    if (
      await this.projectRepo.findOne({
        where: {
          name: updateProjectDto.name,
          id: Not(id),
        },
      })
    )
      throw new ConflictException('Name has been used by another project');

    Object.assign(item, updateProjectDto);

    return await this.projectRepo.save(item);
  }

  async remove(id: string) {
    const deleted = await this.projectRepo.softDelete(id);
    if (deleted.affected === 0)
      throw new NotFoundException('Project not found');
    return null;
  }
}
