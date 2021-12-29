import { Module } from '@nestjs/common';
import { ExamService } from './services/exam.service';
import { ExamController } from './exam.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ExamRepository } from './repositories/exam.repositary';
import { AuthModule } from '../auth/auth.module';
import { QuestionRepository } from './repositories/question.repository';
import { MulterModule } from '@nestjs/platform-express';
import { TestEnrollmentRepository } from './repositories/test-enrollment.repository';
import { TestEnrollmentService } from './services/test-enrollment.service';
import { TestEnrollmentController } from './test-enrollment.controller';
import { SectionRepository } from './repositories/section.respository';
import { QuestionGroupRepository } from './repositories/questionGroup.repository';
import { AnswerRepository } from './repositories/answer.repository';
import { UploadModule } from '../upload/upload.module';

@Module({
  imports: [
    UploadModule,
    AuthModule,
    TypeOrmModule.forFeature([
      ExamRepository,
      SectionRepository,
      QuestionGroupRepository,
      QuestionRepository,
      AnswerRepository,
      TestEnrollmentRepository,
    ]),
    MulterModule.register({
      dest: 'public/examsFiles',
      fileFilter: (req, file, cb) => {
        if (
          !file.originalname.toLowerCase().match(/\.(jpg|jpeg|png|wav|mp3)$/)
        ) {
          // You can always pass an error if something goes wrong:l);
          cb(new Error('You can only upload image / audio files'), null);
        }
        // To accept the file pass `true`, like so:
        cb(null, true);
      },
    }),
  ],
  controllers: [ExamController, TestEnrollmentController],
  providers: [ExamService, TestEnrollmentService],
  exports: [ExamService, TestEnrollmentService],
})
export class ExamModule {}
