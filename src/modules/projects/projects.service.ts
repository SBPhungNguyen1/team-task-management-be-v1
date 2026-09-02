import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UpdateProjectDto } from './dto/update-project.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { ProjectEntity } from './entities/project.entity';
import { Not, Repository } from 'typeorm';
import { QueryTaskDto } from '../tasks/dto/query-task.dto';
import { TaskEntity } from '../tasks/entities/task.entity';
import { PaginationResult } from 'src/common/base/interface/pagination-result.interface';
import { CreateTaskDto } from '../tasks/dto/create-task.dto';

@Injectable()
export class ProjectsService {
  constructor(
    @InjectRepository(ProjectEntity)
    private readonly projectRepo: Repository<ProjectEntity>,

    @InjectRepository(TaskEntity)
    private readonly taskRepo: Repository<TaskEntity>,
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

  async listTask(
    id: string,
    query: QueryTaskDto,
  ): Promise<PaginationResult<TaskEntity>> {
    const limit = Number(query.limit);
    const page = Number(query.page);

    const qb = this.taskRepo
      .createQueryBuilder('task')
      .where('task.project_id = :id', { id });

    if (query.name)
      qb.andWhere('task.name ILIKE :name', { name: `%${query.name}%` });

    if (query.priority)
      qb.andWhere('task.priority = :priority', {
        priority: `${query.priority}`,
      });

    if (query.status)
      qb.andWhere('task.status = :status', {
        status: `${query.status}`,
      });

    const allowedFields = ['created_at', 'name', 'status', 'priority'];
    if (!allowedFields.includes(query.sort_by))
      throw new BadRequestException('Invalid sort field');

    qb.orderBy(`task.${query.sort_by}`, query.sort_order as 'ASC' | 'DESC');

    let items: TaskEntity[];
    let total: number;

    if (query.limit === -1) {
      items = await qb.getMany();
      total = items.length;

      return {
        items,
        meta: {
          page: 1,
          limit: -1,
          total,
          total_pages: 1,
        },
      };
    }

    const skip = (page - 1) * limit;
    qb.skip(skip).take(limit);

    [items, total] = await qb.getManyAndCount();

    return {
      items,
      meta: {
        page,
        limit,
        total,
        total_pages: Math.ceil(total / limit),
      },
    };
  }

  async createTask(id: string, createTaskDto: CreateTaskDto) {
    const created = this.taskRepo.create({ ...createTaskDto, project_id: id });
    return await this.taskRepo.save(created);
  }
}
