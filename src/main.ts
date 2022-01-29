import { NestFactory } from '@nestjs/core';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
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
    .setTitle('englishtest24')
    .setDescription('englishtest24 description')
    .setVersion('1.0')
    .addTag('englishtest24 Application')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  const express = require('express');
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ limit: '50mb', extended: true }));

  //Set up /public for serving static assets
  app.useStaticAssets(join(__dirname, '..', 'public'));

  // app.use((req, res, next) => {
  //   res.header('Access-Control-Allow-Origin', '*');
  //   res.header('Access-Control-Allow-Methods', 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS');
  //   next();
  // });

  // Set up CORS
  // app.enableCors();
  if (process.env.NODE_ENV === 'development') {
    app.enableCors();
  } else {
    app.enableCors({
      origin: 'https://englishtest24h.tk',
      methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
      allowedHeaders: '',
    });
  }

  // User winston logger across the app
  app.useLogger(app.get(WINSTON_MODULE_NEST_PROVIDER));

  await app.listen(serverConfig.port);
}
bootstrap();
