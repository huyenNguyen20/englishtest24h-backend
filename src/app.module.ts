import { Module } from '@nestjs/common';
import { ExamModule } from './exam/exam.module';
import { TypeORMConfig } from './config/typeorm.config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { StudentQuestionModule } from './studentQuestion/question.module';

@Module({
  imports: [
    TypeOrmModule.forRoot(TypeORMConfig),
    ExamModule,
    AuthModule,
    StudentQuestionModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
