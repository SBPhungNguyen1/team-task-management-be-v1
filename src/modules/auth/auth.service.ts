import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { UpdateAuthDto } from './dto/update-auth.dto';
import { LoginDto } from './dto/login.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from '../users/entities/user.entity';
import { UserTokenEntity } from './entities/auth.entity';
import * as bcrypt from 'bcrypt';
import Redis from 'ioredis';
import { JwtPayload } from './auth.strategy';
import { randomUUID } from 'crypto';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import ms, { type StringValue } from 'ms';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepo: Repository<UserEntity>,

    @InjectRepository(UserTokenEntity)
    private readonly tokenRepo: Repository<UserTokenEntity>,

    @Inject('REDIS_CLIENT')
    private readonly redis: Redis,

    private jwtService: JwtService,

    private readonly configService: ConfigService,
  ) {}

  async create(loginDto: LoginDto) {
    const exist = await this.userRepo.findOne({
      where: { email: loginDto.email },
      select: {
        id: true,
        email: true,
        password: true,
        name: true,
        role: true,
      },
    });
    if (!exist) throw new NotFoundException('Wrong username');

    if (!(await this.comparePassword(loginDto.password, exist.password)))
      throw new NotFoundException('Wrong username or password');

    // gen access_token & refresh_token
    const payload: JwtPayload = {
      sub: exist.id,
      email: exist.email,
      role: exist.role,
      name: exist.name,
      jti: randomUUID(),
    };

    const { access_token, refresh_token } = await this.generateTokens(payload);

    // hash refresh_token + save to user table
    const refreshExpiresIn = this.configService.getOrThrow<number>(
      'JWT_REFRESH_EXPIRES_IN',
    );

    const hashRefreshToken = await this.hashPassword(refresh_token);
    const userToken = this.tokenRepo.create({
      user_id: exist.id,
      refresh_token_hash: hashRefreshToken,
      expires_at: new Date(Date.now() + ms(refreshExpiresIn as StringValue)),
      user_agent: loginDto.user_agent,
      ip_address: loginDto.ip_address,
      user: exist,
    });

    await this.tokenRepo.save(userToken);

    const { password, ...user } = exist;

    return { access_token, refresh_token, user };
  }

  async comparePassword(password: string, compared: string): Promise<boolean> {
    const equal = await bcrypt.compare(password, compared);
    return equal;
  }

  async hashPassword(password: string): Promise<string> {
    const saltRounds = 10;
    return await bcrypt.hash(password, saltRounds);
  }

  async generateTokens(
    payload: JwtPayload,
  ): Promise<{ access_token: string; refresh_token: string }> {
    const accessExpiresIn =
      this.configService.getOrThrow<number>('JWT_EXPIRES_IN') ?? '1d';

    const refreshExpiresIn = this.configService.getOrThrow<number>(
      'JWT_REFRESH_EXPIRES_IN',
    );

    const [access_token, refresh_token] = await Promise.all([
      this.jwtService.signAsync(payload, {
        expiresIn: accessExpiresIn,
      }),
      this.jwtService.signAsync(payload, {
        expiresIn: refreshExpiresIn,
      }),
    ]);

    return { access_token, refresh_token };
  }

  findAll() {
    return `This action returns all auth`;
  }

  findOne(id: string) {
    return `This action returns a #${id} auth`;
  }

  update(id: string, updateAuthDto: UpdateAuthDto) {
    return `This action updates a #${id} auth`;
  }

  remove(id: string) {
    return `This action removes a #${id} auth`;
  }
}
