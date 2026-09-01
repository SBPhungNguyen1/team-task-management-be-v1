import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { UpdateOrganizationDto } from './dto/update-organization.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { OrganizationEntity } from './entities/organization.entity';
import { Not, Repository } from 'typeorm';
import { QueryOrganizationDto } from './dto/query-organization.dto';
import { PaginationResult } from 'src/common/base/interface/pagination-result.interface';
import { UserEntity } from '../users/entities/user.entity';
import { ProjectEntity } from '../projects/entities/project.entity';
import { CreateProjectDto } from '../projects/dto/create-project.dto';
import { QueryProjectDto } from '../projects/dto/query-project.dto';

@Injectable()
export class OrganizationsService {
  constructor(
    @InjectRepository(OrganizationEntity)
    private readonly orgRepo: Repository<OrganizationEntity>,

    @InjectRepository(UserEntity)
    private readonly userRepo: Repository<UserEntity>,

    @InjectRepository(ProjectEntity)
    private readonly projectRepo: Repository<ProjectEntity>,
  ) {}

  async create(createOrganizationDto: CreateOrganizationDto) {
    const item = await this.orgRepo.findOneBy({
      name: createOrganizationDto.name,
    });
    if (item)
      throw new ConflictException('This organization name has been in used');

    const created = this.orgRepo.create(createOrganizationDto);

    return await this.orgRepo.save(created);
  }

  async findAll(
    query: QueryOrganizationDto,
  ): Promise<PaginationResult<OrganizationEntity>> {
    const limit = Number(query.limit);
    const page = Number(query.page);

    const qb = this.orgRepo.createQueryBuilder('org');

    if (query.name) {
      qb.andWhere('org.name ILIKE :name', { name: `%${query.name}%` });
    }

    const allowedFields = ['created_at', 'name'];
    if (!allowedFields.includes(query.sort_by))
      throw new BadRequestException('Invalid sort_by field');

    qb.orderBy(`org.${query.sort_by}`, query.sort_order as 'ASC' | 'DESC');

    let items: OrganizationEntity[];
    let total: number;

    if (limit === -1) {
      items = await qb.getMany();
      total = items.length;

      return {
        items,
        meta: {
          limit: -1,
          page: 1,
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
        limit,
        page,
        total,
        total_pages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    const item = await this.orgRepo.findOne({
      where: {
        id,
      },
      relations: {
        users: true,
      },
    });
    if (!item) throw new NotFoundException('No organization found');

    return item;
  }

  async update(id: string, updateOrganizationDto: UpdateOrganizationDto) {
    const item = await this.findOne(id);

    if (
      await this.orgRepo.findOne({
        where: {
          name: updateOrganizationDto.name,
          id: Not(id),
        },
      })
    ) {
      throw new ConflictException('This organization name has been in used');
    }

    Object.assign(item, updateOrganizationDto);

    return await this.orgRepo.save(item);
  }

  async remove(id: string) {
    const deleted = await this.orgRepo.softDelete(id);
    if (deleted.affected === 0)
      throw new NotFoundException('No organization found');
    return null;
  }

  async addMember(orgId: string, ids: string[]) {
    const organization = await this.findOne(orgId);

    const users = await this.userRepo.find({
      where: ids.map((id) => ({ id })),
      relations: {
        organization: true,
      },
    });

    if (users.length !== ids.length) {
      throw new NotFoundException('Some users not found');
    }

    const existedIds = organization.users.map((user) => user.id);

    const alreadyMembers = users.filter((user) => existedIds.includes(user.id));

    if (alreadyMembers.length > 0) {
      throw new ConflictException('Some users are already members');
    }

    const alreadyInOtherOrg = users.filter(
      (user) => user.organization && user.organization.id !== organization.id,
    );

    if (alreadyInOtherOrg.length > 0) {
      throw new ConflictException(
        'Some users already belong to another organization',
      );
    }

    users.forEach((user) => {
      user.organization = organization;
    });

    await this.userRepo.save(users);

    return users;
  }

  async listProject(id: string, query: QueryProjectDto) {
    const limit = Number(query.limit);
    const page = Number(query.page);

    const qb = this.projectRepo
      .createQueryBuilder('project')
      .leftJoinAndSelect('project.organization', 'org')
      .where('org.id = :orgId', { orgId: id });

    if (query.name) {
      qb.andWhere('project.name ILIKE :name', {
        name: `%${query.name}%`,
      });
    }

    if (query.description) {
      qb.andWhere('project.description ILIKE :description', {
        description: `%${query.description}%`,
      });
    }

    const allowedFields = ['created_at', 'name'];

    if (!allowedFields.includes(query.sort_by)) {
      throw new BadRequestException('Invalid sort_by field');
    }

    qb.orderBy(`project.${query.sort_by}`, query.sort_order as 'ASC' | 'DESC');

    let items: ProjectEntity[];
    let total: number;

    if (limit === -1) {
      items = await qb.getMany();
      total = items.length;

      return {
        items,
        meta: {
          limit: -1,
          page: 1,
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
        limit,
        page,
        total,
        total_pages: Math.ceil(total / limit),
      },
    };
  }

  async addProject(id: string, createProjectDto: CreateProjectDto) {
    const org = await this.findOne(id);
    const created = this.projectRepo.create({
      ...createProjectDto,
      organization_id: org.id,
    });
    return await this.projectRepo.save(created);
  }
}
