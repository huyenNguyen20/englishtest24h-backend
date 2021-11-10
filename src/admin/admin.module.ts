import { Module } from '@nestjs/common';
import { AuthModule } from 'src/auth/auth.module';
import { ExamModule } from 'src/exam/exam.module';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';

@Module({
  imports: [ExamModule, AuthModule],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}
