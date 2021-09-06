import { Module } from '@nestjs/common';
import { PostService } from './post.service';
import { PostController } from './post.controller';
import { AuthModule } from 'src/auth/auth.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommentRepository, PostRepository } from './post.repository';
import { ExamModule } from 'src/exam/exam.module';

@Module({
  imports: [
    ExamModule,
    AuthModule,
    TypeOrmModule.forFeature([PostRepository, CommentRepository]),
  ],
  controllers: [PostController],
  providers: [PostService],
})
export class PostModule {}
