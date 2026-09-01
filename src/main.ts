import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get<ConfigService>(ConfigService);

  app.setGlobalPrefix('api');
  app.useGlobalInterceptors(new TransformInterceptor());

  // swagger
  const config = new DocumentBuilder()
    .setTitle('Team Task Management BE API')
    .setDescription('API Documentation')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);

  SwaggerModule.setup('api-docs', app, document);

  const port = configService.get<number>('PORT') ?? 3001;
  const host = configService.get<string>('HOST') ?? `localhost`;

  await app.listen(port);

  console.log(`API connect at: http://${host}:${port}/api`);
  console.log(`Swagger: http://${host}:${port}/api-docs`);
}
bootstrap();
