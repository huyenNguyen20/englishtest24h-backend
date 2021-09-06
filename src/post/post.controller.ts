import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Put,
  ParseIntPipe,
  ValidationPipe,
} from '@nestjs/common';
import { PostService } from './post.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { AuthGuard } from '@nestjs/passport';
import { getUser } from 'src/auth/decorator/getUser.decorator';
import { User } from 'src/auth/entities/user.entity';

@Controller('post')
export class PostController {
  constructor(private readonly postService: PostService) {}
  /*******Post Routes*********/
  @Post('/:examId')
  @UseGuards(AuthGuard())
  createPostByExam(
    @Body(new ValidationPipe()) createPostDto: CreatePostDto,
    @Param('examId', ParseIntPipe) examId: number,
    @getUser() user: User,
  ) {
    return this.postService.createPost('exam', createPostDto, examId, user);
  }

  @Post('/enrollments/:enrollmentId')
  @UseGuards(AuthGuard())
  createPostByEnrollment(
    @Body(new ValidationPipe()) createPostDto: CreatePostDto,
    @Param('enrollmentId', ParseIntPipe) enrollmentId: number,
    @getUser() user: User,
  ) {
    return this.postService.createPost(
      'enrollment',
      createPostDto,
      enrollmentId,
      user,
    );
  }

  @Get('/:examId')
  getPostsByExamId(@Param('examId', ParseIntPipe) examId: number) {
    return this.postService.getPosts('exam', examId);
  }

  @Get('/enrollments/:enrollmentId')
  getPostsByEnrollmentId(
    @Param('enrollmentId', ParseIntPipe) enrollmentId: number,
  ) {
    return this.postService.getPosts('enrollment', enrollmentId);
  }

  @Put('/:examId/:postId')
  @UseGuards(AuthGuard())
  updatePostByExamId(
    @Param('examId', ParseIntPipe) examId: number,
    @Param('postId', ParseIntPipe) postId: number,
    @getUser() user: User,
    @Body() updatePostDto: UpdatePostDto,
  ) {
    return this.postService.updatePost(
      'exam',
      updatePostDto,
      postId,
      examId,
      user,
    );
  }

  @Put('/enrollments/:enrollmentId/:postId')
  @UseGuards(AuthGuard())
  updatePostByEnrollment(
    @Param('enrollmentId', ParseIntPipe) enrollmentId: number,
    @Param('postId', ParseIntPipe) postId: number,
    @getUser() user: User,
    @Body() updatePostDto: UpdatePostDto,
  ) {
    return this.postService.updatePost(
      'enrollment',
      updatePostDto,
      postId,
      enrollmentId,
      user,
    );
  }

  @Delete('/:examId/:postId')
  @UseGuards(AuthGuard())
  deletePostByExamId(
    @Param('examId', ParseIntPipe) examId: number,
    @Param('postId', ParseIntPipe) postId: number,
    @getUser() user: User,
  ) {
    return this.postService.deletePost('exam', postId, examId, user);
  }

  @Delete('/enrollments/:enrollmentId/:postId')
  @UseGuards(AuthGuard())
  deletePostByEnrollmentId(
    @Param('enrollmentId', ParseIntPipe) enrollmentId: number,
    @Param('postId', ParseIntPipe) postId: number,
    @getUser() user: User,
  ) {
    return this.postService.deletePost(
      'enrollment',
      postId,
      enrollmentId,
      user,
    );
  }

  /*******Comment Routes*********/
  @Post('/:examId/:postId/comments')
  @UseGuards(AuthGuard())
  createCommentByExam(
    @Body(new ValidationPipe()) createPostDto: CreatePostDto,
    @Param('postId', ParseIntPipe) postId: number,
    @getUser() user: User,
  ) {
    return this.postService.createComment(createPostDto, postId, user);
  }

  @Get('/:examId/:postId/comments')
  getComment(@Param('postId', ParseIntPipe) postId: number) {
    return this.postService.getComments(postId);
  }

  @Put('/:examId/:postId/comments/:commentId')
  @UseGuards(AuthGuard())
  updateComment(
    @Param('postId', ParseIntPipe) postId: number,
    @Param('commentId', ParseIntPipe) commentId: number,
    @getUser() user: User,
    @Body() updatePostDto: UpdatePostDto,
  ) {
    return this.postService.updateComment(
      updatePostDto,
      commentId,
      postId,
      user,
    );
  }

  @Delete('/:examId/:postId/comments/:commentId')
  @UseGuards(AuthGuard())
  deleteComment(
    @Param('postId', ParseIntPipe) postId: number,
    @Param('commentId', ParseIntPipe) commentId: number,
    @getUser() user: User,
  ) {
    return this.postService.deleteComment(commentId, postId, user);
  }
}
