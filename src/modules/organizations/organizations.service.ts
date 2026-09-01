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

@Injectable()
export class OrganizationsService {
  constructor(
    @InjectRepository(OrganizationEntity)
    private readonly orgRepo: Repository<OrganizationEntity>,
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
    const item = await this.orgRepo.findOneBy({
      id,
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
}
