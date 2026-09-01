import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from '../users/entities/user.entity';
import { Repository } from 'typeorm';
import { RequestWithUser } from 'src/common/types/request-with-user.type';

@Injectable()
export class ProfileService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepo: Repository<UserEntity>,
  ) {}

  async findProfile(req: RequestWithUser) {
    const user = req.user;
    const item = await this.userRepo.findOne({ where: { id: user.sub } });
    if (!item) throw new UnauthorizedException('No user found');

    console.log('User payload from JWT:', req.user);
    return item;
  }

  update(updateProfileDto: UpdateProfileDto) {
    return `This action updates a  profile`;
  }

  changePassword(changePasswordDto: ChangePasswordDto) {
    return 'This action adds a new profile';
  }
}
