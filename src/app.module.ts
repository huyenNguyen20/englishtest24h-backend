import { Module } from '@nestjs/common';
import { WinstonModule } from 'nest-winston';
import * as winston from 'winston';
import { join } from 'path';
import { ExamModule } from './exam/exam.module';
import { TypeORMConfig } from './config/typeorm.config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { StudentQuestionModule } from './studentQuestion/question.module';
import { AdminModule } from './admin/admin.module';
import { CaslModule } from './casl/casl.module';


@Module({
  imports: [
    TypeOrmModule.forRoot(TypeORMConfig),
    WinstonModule.forRoot({
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json(),
      ),
      transports: [   
        new winston.transports.File({
          dirname: join(__dirname, './../log/debug/'), //path to where save loggin result 
          filename: 'debug.log', //name of file where will be saved logging result
          level: 'debug',
        }),
        new winston.transports.File({
          dirname: join(__dirname, './../log/info/'),
          filename: 'info.log',
          level: 'info',
        }),
        new winston.transports.File({
          dirname: join(__dirname, './../log/errors/'),
          filename: 'errors.log',
          level: 'error',
        }),
        new winston.transports.File({
          dirname: join(__dirname, './../log/warning/'),
          filename: 'warning.log',
          level: 'warning',
        }),
      ],
    }),
    ExamModule,
    AuthModule,
    AdminModule,
    StudentQuestionModule,
    CaslModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
