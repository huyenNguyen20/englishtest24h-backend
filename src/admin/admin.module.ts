import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { CaslModule } from '../casl/casl.module';
import { ExamModule } from '../exam/exam.module';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';

@Module({
  imports: [ExamModule, AuthModule, CaslModule],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}
