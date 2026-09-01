/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as Minio from 'minio';
import { MINIO_TOKEN } from './minio.decorator';

@Global()
@Module({
  exports: [MINIO_TOKEN],
  providers: [
    {
      inject: [ConfigService],
      provide: MINIO_TOKEN,
      useFactory: (configService: ConfigService): Minio.Client => {
        const client = new Minio.Client({
          endPoint: configService.getOrThrow('MINIO_ENDPOINT'),
          port: +configService.getOrThrow('MINIO_PORT'),
          accessKey: configService.getOrThrow('MINIO_ROOT_USER'),
          secretKey: configService.getOrThrow('MINIO_ROOT_PASSWORD'),
          useSSL: false,
        });
        return client;
      },
    },
  ],
})
export class MinioModule {}
