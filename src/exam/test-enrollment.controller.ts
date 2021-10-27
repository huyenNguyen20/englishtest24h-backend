import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
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
import { EnrollmentDataToTeacher } from './interface/enrollment-data-to-teacher.interface';
import { TestEnrollmentValidationPipe } from './pipes/test-enrollment.pipe';
import { TestEnrollmentService } from './test-enrollment.service';

@Controller('testEnrollment')
export class TestEnrollmentController {
  constructor(private readonly testEnrollmentService: TestEnrollmentService) {}
  @Get('/')
  async getAllEnrollmentIndexes(): Promise<Partial<TestEnrollment>[]> {
    return await this.testEnrollmentService.getAllEnrollmentIndexes();
  }

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

  // Method for teacher to get information about all enrollments in one exam
  @Get('/:examId/enrollments')
  @UseGuards(AuthGuard())
  async getAllScores(
    @Param('examId', ParseIntPipe) examId: number,
    @getUser() user: User,
  ): Promise<EnrollmentDataToTeacher[]> {
    return await this.testEnrollmentService.getAllScores(examId, user);
  }

  @Get('/:examId/enrollments/:enrollmentId')
  async getExamResult(
    @Param('examId', ParseIntPipe) examId: number,
    @Param('enrollmentId', ParseIntPipe) enrollmentId: number,
  ): Promise<{enrollment: TestEnrollment, teacherId: number, isPublished: boolean}> {
    return await this.testEnrollmentService.getExamResult(examId, enrollmentId);
  }

  // Teacher update student's test score
  @Put('/:examId/enrollments/:enrollmentId/updateScore')
  @UseGuards(AuthGuard())
  async updateScore(
    @Body(new ValidationPipe()) body: {score : string},
    @Param('examId', ParseIntPipe) examId: number,
    @Param('enrollmentId', ParseIntPipe) enrollmentId: number,
    @getUser() user: User,
  ): Promise<TestEnrollment> {
    const score = parseInt(body.score, 10);
    if(isNaN(score)) throw new BadRequestException("score must be a number");
    else return await this.testEnrollmentService.updateScore(
        parseInt(body.score),
        examId,
        enrollmentId,
        user,
      );
  }

  // Teacher update teacher grading
  @Put('/:examId/enrollments/:enrollmentId/teacherGrading')
  @UseGuards(AuthGuard())
  async updateTeacherGrading(
    @Body(new ValidationPipe()) body: {teacherGrading : string},
    @Param('examId', ParseIntPipe) examId: number,
    @Param('enrollmentId', ParseIntPipe) enrollmentId: number,
    @getUser() user: User,
  ): Promise<TestEnrollment> {
    return await this.testEnrollmentService.updateTeacherGrading(
      body.teacherGrading,
      examId,
      enrollmentId,
      user,
    );
  }
}
