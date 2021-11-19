import { Module } from '@nestjs/common';
import { ExamService } from './exam.service';
import { ExamController } from './exam.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ExamRepository } from './exam.repositary';
import { AuthModule } from 'src/auth/auth.module';
import { QuestionRepository } from './question.repository';
import { MulterModule } from '@nestjs/platform-express';
import { TestEnrollmentRepository } from './test-enrollment.repository';
import { TestEnrollmentService } from './test-enrollment.service';
import { TestEnrollmentController } from './test-enrollment.controller';
import { SectionRepository } from './section.respository';
import { QuestionGroupRepository } from './questionGroup.repository';
import { AnswerRepository } from './answer.repository';
import { UploadModule } from 'src/upload/upload.module';

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
          !file.originalname
            .toLowerCase()
            .match(/\.(jpg|jpeg|png|wav|mp3)$/)
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
