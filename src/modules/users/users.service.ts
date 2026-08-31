import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { QueryUserDto } from './dto/query-user.dto';
import { Not, Repository } from 'typeorm';
import { UserEntity } from './entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { PaginationResult } from 'src/common/base/interface/pagination-result.interface';
import * as bcrypt from 'bcrypt';
@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepo: Repository<UserEntity>,
  ) {}

  async create(createUserDto: CreateUserDto) {
    const isExisted = await this.userRepo.exists({
      where: { email: createUserDto.email },
    });
    if (isExisted) throw new BadRequestException('Email existed');

    const hashedPassword = await this.hashPassword(createUserDto.password);
    const item = this.userRepo.create({
      ...createUserDto,
      password: hashedPassword,
    });

    const saved = await this.userRepo.save(item);
    const { password, ...result } = saved;
    return result;
  }

  async hashPassword(password: string): Promise<string> {
    const saltRounds = 10;
    return await bcrypt.hash(password, saltRounds);
  }

  async findAll(query: QueryUserDto): Promise<PaginationResult<UserEntity>> {
    const page = Number(query.page);
    const limit = Number(query.limit);

    const qb = this.userRepo.createQueryBuilder('user');

    if (query.name) {
      qb.andWhere(`user.name ILIKE :name`, { name: `%${query.name}%` });
    }
    if (query.email) {
      qb.andWhere('user.email ILIKE :email', { email: `%${query.email}%` });
    }
    if (query.role) {
      qb.andWhere('user.role = :role', { role: `${query.role}` });
    }

    // sort
    const allowFields = ['name', 'email', 'created_at'];
    if (!allowFields.includes(query.sort_by))
      throw new BadRequestException('Invalid sort field');

    qb.orderBy(`user.${query.sort_by}`, query.sort_order as 'ASC' | 'DESC');

    // query data
    let items: UserEntity[];
    let total: number;

    // 1. Query all (when limit === -1)
    if (limit === -1) {
      items = await qb.getMany();
      total = items.length;

      return {
        items,
        meta: {
          page: 1,
          total,
          limit,
          total_pages: 1,
        },
      };
    }

    // 2. Query regarding to limit & page
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
    const item = await this.userRepo.findOne({ where: { id } });
    if (!item) throw new NotFoundException('No user found with this id');
    return item;
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    const item = await this.userRepo.findOneBy({ id });
    if (!item) throw new NotFoundException('No user found with this id');

    if (updateUserDto.email && updateUserDto.email !== item.email) {
      const isEmailTaken = await this.userRepo.exists({
        where: {
          email: updateUserDto.email,
          id: Not(id),
        },
      });

      if (isEmailTaken) {
        throw new BadRequestException(
          'Email is already in use by another account',
        );
      }
    }

    Object.assign(item, updateUserDto);
    return await this.userRepo.save(item);
  }

  async remove(id: string) {
    const deleted = await this.userRepo.softDelete(id);
    if (deleted.affected === 0)
      throw new NotFoundException('No user found with this id');
    return null;
  }
}
