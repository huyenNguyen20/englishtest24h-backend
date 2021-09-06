import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
  ValidationPipe,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { getUser } from 'src/auth/decorator/getUser.decorator';
import { User } from 'src/auth/entities/user.entity';
import { CreateTestEnrollmentDto } from './dto/create-test-enrollment.dto';
import { TestEnrollment } from './entities/test-enrollment.entity';
import { TestEnrollmentValidationPipe } from './pipes/test-enrollment.pipe';
import { TestEnrollmentService } from './test-enrollment.service';
import * as config from 'config';

@Controller('testEnrollment')
export class TestEnrollmentController {
  constructor(private readonly testEnrollmentService: TestEnrollmentService) {}
  @Get('/myTests')
  @UseGuards(AuthGuard())
  async getMyTests(@getUser() user: User): Promise<any> {
    return await this.testEnrollmentService.getMyTests(user);
  }

  @Get('/testTakers/:examId')
  async getTestTakers(
    @Param('examId', ParseIntPipe) examId: number,
  ): Promise<any> {
    return await this.testEnrollmentService.getTestTakersScores(examId);
  }

  @Post('/:examId')
  @UseGuards(AuthGuard())
  async postTestScore(
    @Body(new TestEnrollmentValidationPipe())
    createTestEnrollmentDto: CreateTestEnrollmentDto,
    @Param('examId', ParseIntPipe) examId: number,
    @getUser() user: User,
  ): Promise<TestEnrollment> {
    return await this.testEnrollmentService.postTestScore(
      createTestEnrollmentDto,
      examId,
      user,
    );
  }

  @Get('/:examId')
  @UseGuards(AuthGuard())
  async getScore(
    @Param('examId', ParseIntPipe) examId: number,
    @getUser() user: User,
  ): Promise<TestEnrollment> {
    return await this.testEnrollmentService.getScore(examId, user);
  }

  @Get('/:examId/enrollments')
  async getAllScores(
    @Param('examId', ParseIntPipe) examId: number,
  ): Promise<TestEnrollment[]> {
    return await this.testEnrollmentService.getAllScores(examId);
  }

  @Get('/:examId/enrollments/:enrollmentId')
  async getExamResult(
    @Param('examId', ParseIntPipe) examId: number,
    @Param('enrollmentId', ParseIntPipe) enrollmentId: number,
  ): Promise<TestEnrollment> {
    return await this.testEnrollmentService.getExamResult(enrollmentId);
  }

  @Post('/:examId/audio')
  @UseGuards(AuthGuard())
  @UseInterceptors(FileFieldsInterceptor([{ name: 'audio', maxCount: 1 }]))
  async uploadSpeakingAudio(@UploadedFiles() files) {
    if (
      files &&
      files.audio &&
      !files.audio[0].originalname.toLowerCase().match(/\.(wav|mp3)/)
    )
      throw new BadRequestException('Must be An Audio File');
    if (files && files.audio)
      return `${config.get('server.url')}/examsFiles/${
        files.audio[0].filename
      }`;
    else return null;
  }
}
