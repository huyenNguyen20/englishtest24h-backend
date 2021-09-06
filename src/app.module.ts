import { Module } from '@nestjs/common';
import { ExamModule } from './exam/exam.module';
import { TypeORMConfig } from './config/typeorm.config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { PostModule } from './post/post.module';
@Module({
  imports: [
    TypeOrmModule.forRoot(TypeORMConfig),
    ExamModule,
    AuthModule,
    PostModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
