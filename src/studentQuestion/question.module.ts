import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ExamModule } from '../exam/exam.module';
import { StudentQuestionRepository } from './question.repository';
import { StudentQuestionController } from './question.controller';
import { StudentQuestionService } from './question.service';

@Module({
  imports: [
    ExamModule,
    AuthModule,
    TypeOrmModule.forFeature([StudentQuestionRepository]),
  ],
  controllers: [StudentQuestionController],
  providers: [StudentQuestionService],
})
export class StudentQuestionModule {}
