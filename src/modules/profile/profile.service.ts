import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from '../users/entities/user.entity';
import { Not, Repository } from 'typeorm';
import { RequestWithUser } from 'src/common/types/request-with-user.type';
import { comparePassword, hashPassword } from 'src/common/utils/password.util';

@Injectable()
export class ProfileService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepo: Repository<UserEntity>,
  ) {}

  async findProfile(req: RequestWithUser) {
    const item = await this.findUser(req);

    console.log('User payload from JWT:', req.user);
    return item;
  }

  async update(updateProfileDto: UpdateProfileDto, req: RequestWithUser) {
    const item = await this.findUser(req);

    if (updateProfileDto.email) {
      const isEmailTaken = await this.userRepo.exists({
        where: {
          email: updateProfileDto.email,
          id: Not(item.id),
        },
      });

      if (isEmailTaken)
        throw new BadRequestException(
          'Email is already in use by another account',
        );
    }

    Object.assign(item, updateProfileDto);

    return await this.userRepo.save(item);
  }

  async changePassword(
    changePasswordDto: ChangePasswordDto,
    req: RequestWithUser,
  ) {
    if (
      changePasswordDto.confirm_new_password !== changePasswordDto.new_password
    )
      throw new BadRequestException('Passwords are not matched');

    const item = await this.findUserWithPassword(req);

    if (
      !(await comparePassword(
        changePasswordDto.current_password,
        item.password,
      ))
    )
      throw new BadRequestException('Current password is wrong');

    const hashedPassword = await hashPassword(changePasswordDto.new_password);
    Object.assign(item, { password: hashedPassword });

    const { password, ...result } = await this.userRepo.save(item);

    return result;
  }

  async findUser(req: RequestWithUser): Promise<UserEntity> {
    const item = await this.userRepo.findOne({ where: { id: req.user.sub } });
    if (!item) throw new UnauthorizedException('No user found');
    return item;
  }

  async findUserWithPassword(req: RequestWithUser): Promise<UserEntity> {
    const item = await this.userRepo.findOne({
      where: { id: req.user.sub },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        password: true,
      },
    });
    if (!item) throw new UnauthorizedException('No user found');
    return item;
  }
}
