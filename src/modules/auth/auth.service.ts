/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { LoginDto } from './dto/login.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { MoreThan, Repository } from 'typeorm';
import { UserEntity } from '../users/entities/user.entity';
import { UserTokenEntity } from './entities/auth.entity';
import * as bcrypt from 'bcrypt';
import Redis from 'ioredis';
import { JwtPayload } from './auth.strategy';
import { randomUUID } from 'crypto';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import ms, { type StringValue } from 'ms';
import { RegisterDto } from './dto/register.dto';
import { RefreshDto } from './dto/refresh.dto';
import { LogoutDto } from './dto/logout.dto';

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

  async login(loginDto: LoginDto) {
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
    const accessSecret = this.configService.getOrThrow<string>('JWT_SECRET');

    const refreshSecret =
      this.configService.getOrThrow<string>('JWT_REFRESH_SECRET');

    const accessExpiresIn =
      this.configService.getOrThrow<number>('JWT_EXPIRES_IN') ?? '1d';

    const refreshExpiresIn =
      this.configService.getOrThrow<number>('JWT_REFRESH_EXPIRES_IN') ?? '7d';

    const [access_token, refresh_token] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: accessSecret,
        expiresIn: accessExpiresIn,
      }),
      this.jwtService.signAsync(payload, {
        secret: refreshSecret,
        expiresIn: refreshExpiresIn,
      }),
    ]);

    return { access_token, refresh_token };
  }

  async register(registerDto: RegisterDto) {
    const { email, password, confirm_password, ...otherData } = registerDto;

    if (password !== confirm_password) {
      throw new BadRequestException('The passwords do not match');
    }

    const normalizedEmail = email.toLowerCase().trim();

    const exist = await this.userRepo.findOne({
      where: { email: normalizedEmail },
    });
    if (exist) {
      throw new ConflictException('This email is already in use');
    }

    const hashedPassword = await this.hashPassword(registerDto.password);

    const item = this.userRepo.create({
      ...otherData,
      email: normalizedEmail,
      password: hashedPassword,
    });

    const { password: _, ...result } = await this.userRepo.save(item);

    return result;
  }

  async refresh(refreshDto: RefreshDto) {
    // 1. verify sign
    // 2. get tokens that is still valid
    // 3. get the match token
    // 4. check token reuse detection
    // 5. get most fresh info of user
    // 6. gen new access, refresh
    // 7. update hash refresh + expires in usertoken table

    const { refresh_token, user_agent, ip_address } = refreshDto;

    // 1. verify sign
    let payload: JwtPayload;
    try {
      payload = await this.jwtService.verifyAsync<JwtPayload>(refresh_token, {
        secret: this.configService.getOrThrow<string>('JWT_REFRESH_SECRET'),
      });
    } catch (error) {
      console.log('VERIFY ERROR:', error);
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    // 2. get tokens that is still valid
    const activeTokens = await this.tokenRepo.find({
      where: {
        user_id: payload.sub,
        expires_at: MoreThan(new Date()),
      },
    });

    // 3. get the match token
    let matchedTokenRec: UserTokenEntity | null = null;
    for (const record of activeTokens) {
      const isMatch = await this.comparePassword(
        refresh_token,
        record.refresh_token_hash,
      );
      if (isMatch) {
        matchedTokenRec = record;
        break;
      }
    }

    // 4. check token reuse detection
    if (!matchedTokenRec) {
      await this.tokenRepo.delete({ user_id: payload.sub });
      throw new ForbiddenException(
        'Access denied. Suspicious activity detected',
      );
    }

    // 5. get most fresh info of user
    const user = await this.userRepo.findOneBy({ id: payload.sub });
    if (!user) throw new UnauthorizedException('User not found');

    // 6. gen new access, refresh
    const newPayload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
      jti: randomUUID(),
    };

    const tokens = await this.generateTokens(newPayload);

    // 7. update hash refresh + expires in usertoken table
    const refreshExpiresIn = this.configService.getOrThrow<string>(
      'JWT_REFRESH_EXPIRES_IN',
    );
    const newHash = await this.hashPassword(tokens.refresh_token);

    matchedTokenRec.refresh_token_hash = newHash;
    matchedTokenRec.expires_at = new Date(
      Date.now() + ms(refreshExpiresIn as StringValue),
    );

    await this.tokenRepo.save(matchedTokenRec);

    return tokens;
  }

  async logout(logoutDto: LogoutDto, access_token?: string) {
    // 1. verify token
    // 2. find tokens of user (many - as allow many devices)
    // 3. find the exact token
    // 4. delete token in DB
    // 5. add to blacklist

    const { refresh_token, user_agent, ip_address } = logoutDto;

    // 1. verify token
    let payload: JwtPayload;
    try {
      payload = await this.jwtService.verifyAsync<JwtPayload>(refresh_token, {
        secret: this.configService.getOrThrow<string>('JWT_REFRESH_SECRET'),
      });
    } catch (error) {
      console.log('VERIFY ERROR:', error);
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    // 2. find tokens of user (many - as allow many devices)
    const userTokens = await this.tokenRepo.find({
      where: {
        user_id: payload.sub,
      },
    });

    // 3. find the exact token
    let matchedTokenId: string | null = null;
    for (const record of userTokens) {
      const isMatched = await bcrypt.compare(
        refresh_token,
        record.refresh_token_hash,
      );
      if (isMatched) {
        matchedTokenId = record.id;
        break;
      }
    }

    // 4. delete token in DB
    if (matchedTokenId) {
      await this.tokenRepo.delete(matchedTokenId);
    }

    // 5. add to blacklist
    if (access_token) {
      const decoded = this.jwtService.decode<{
        exp?: number;
        jti?: string;
      }>(access_token);

      if (decoded?.exp) {
        const currentTime = Math.floor(Date.now() / 1000);
        const ttl = decoded.exp - currentTime;

        if (ttl > 0) {
          const blacklistKey = decoded.jti
            ? `blacklist:jti:${decoded.jti}`
            : `blacklist:token:${access_token}`;

          await this.redis.set(blacklistKey, 'revoked', 'EX', ttl);
        }
      }
    }

    return `This action returns all auth`;
  }
}
