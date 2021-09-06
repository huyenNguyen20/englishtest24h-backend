import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { join } from 'path';
import * as sconfig from 'config';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const serverConfig = sconfig.get('server');
  const clientConfig = sconfig.get('client');

  //Bootstrap Swagger API
  const config = new DocumentBuilder()
    .setTitle('Test Application')
    .setDescription('Test Application description')
    .setVersion('1.0')
    .addTag('Test Application')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  const express = require('express');
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ limit: '50mb', extended: true }));

  //Set up /public for serving static assets
  app.useStaticAssets(join(__dirname, '..', 'public'));

  if (process.env.NODE_ENV === 'development') {
    app.enableCors();
  } else {
    app.enableCors({
      origin: process.env.CLIENT_URL,
    });
  }

  await app.listen(serverConfig.port || process.env.PORT);
}
bootstrap();
