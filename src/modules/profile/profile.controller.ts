import { Controller, Get, Post, Body, Patch, Req } from '@nestjs/common';
import { ProfileService } from './profile.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { ApiBearerAuth } from '@nestjs/swagger';
import type { RequestWithUser } from 'src/common/types/request-with-user.type';

@Controller('profile')
@ApiBearerAuth()
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @Get()
  findProfile(@Req() req: RequestWithUser) {
    return this.profileService.findProfile(req);
  }

  @Patch()
  update(
    @Body() updateProfileDto: UpdateProfileDto,
    @Req() req: RequestWithUser,
  ) {
    return this.profileService.update(updateProfileDto, req);
  }

  @Post('password')
  changePassword(
    @Body() changePasswordDto: ChangePasswordDto,
    @Req() req: RequestWithUser,
  ) {
    return this.profileService.changePassword(changePasswordDto, req);
  }
}
