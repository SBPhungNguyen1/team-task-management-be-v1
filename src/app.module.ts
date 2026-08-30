import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      useFactory: (configService: ConfigService) => {
        const timezone = configService.getOrThrow<string>('TZ');
        process.env.TZ = timezone;

        return {
          type: 'postgres',
          host: configService.getOrThrow<string>('DB_HOST'),
          port: configService.getOrThrow<number>('DB_PORT'),
          username: configService.getOrThrow<string>('DB_USERNAME'),
          password: configService.getOrThrow<string>('DB_PASSWORD'),
          database: configService.getOrThrow<string>(`DB_DATABASE`),
          entities: [__dirname + '**/*.entity{.ts,.js}'],
          synchronize:
            configService.getOrThrow<string>('ENV_NODE') === 'development',
          extra: {
            options: `-c timezone=${timezone}`,
          },
        };
      },
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
