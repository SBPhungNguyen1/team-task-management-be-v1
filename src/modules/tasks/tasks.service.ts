import { Injectable, NotFoundException } from '@nestjs/common';
import { UpdateTaskDto } from './dto/update-task.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { TaskEntity } from './entities/task.entity';
import { Repository } from 'typeorm';

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(TaskEntity)
    private readonly taskRepo: Repository<TaskEntity>,
  ) {}

  async findOne(id: string) {
    const item = await this.taskRepo.findOne({
      where: { id },
      relations: {
        project: {
          organization: true,
        },
      },
    });
    if (!item) throw new NotFoundException('Task Not Found');
    return item;
  }

  async update(id: string, updateTaskDto: UpdateTaskDto) {
    const item = await this.findOne(id);
    const updated = Object.assign(item, updateTaskDto);
    return await this.taskRepo.save(updated);
  }

  async remove(id: string) {
    const deleted = await this.taskRepo.softDelete(id);
    if (deleted.affected === 0) throw new NotFoundException('Task not found');
    return null;
  }
}
