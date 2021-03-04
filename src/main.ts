import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { Logger, ValidationPipe } from '@nestjs/common';
import * as cookieParser from 'cookie-parser';

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
async function bootstrap() {
  const logger = new Logger('bootstrap');

  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe());
  app.use(cookieParser());

  const configService = app.get(ConfigService);
  const port = configService.get('server.port');

  const options = new DocumentBuilder()
    .setTitle('FilterYa API')
    .setDescription('FilterYa API')
    .setVersion('0.1')
    .addTag('auth', 'Handles users sign-up and sign-in')
    .addTag('ping', 'Endpoint used to check the API health')
    .build();

  const document = SwaggerModule.createDocument(app, options);
  SwaggerModule.setup('api', app, document);

  await app.listen(port);

  logger.log(`Server running on port: ${port}`);
  logger.log(`Running on ${configService.get('environment')} environment`);
}
bootstrap();
