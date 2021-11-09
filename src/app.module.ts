import { Module } from '@nestjs/common';
import { ExamModule } from './exam/exam.module';
import { TypeORMConfig } from './config/typeorm.config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { StudentQuestionModule } from './studentQuestion/question.module';
import { AdminModule } from './admin/admin.module';

@Module({
  imports: [
    TypeOrmModule.forRoot(TypeORMConfig),
    ExamModule,
    AuthModule,
    AdminModule,
    StudentQuestionModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
