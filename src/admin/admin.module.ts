import { Module } from '@nestjs/common';
import { AuthModule } from 'src/auth/auth.module';
import { CaslModule } from 'src/casl/casl.module';
import { ExamModule } from 'src/exam/exam.module';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';

@Module({
  imports: [ExamModule, AuthModule, CaslModule],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}
