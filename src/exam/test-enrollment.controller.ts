import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  UseGuards,
  ValidationPipe,
  Response,
  Inject,
  InternalServerErrorException,
  HttpStatus
} from '@nestjs/common';
import { Logger } from "winston";
import { AuthGuard } from '@nestjs/passport';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { getUser } from 'src/auth/decorator/getUser.decorator';
import { User } from 'src/auth/entities/user.entity';
import { CreateTestEnrollmentDto } from './dto/create-test-enrollment.dto';
import { FilterDto } from './dto/filter.dto';
import { TestEnrollment } from './entities/test-enrollment.entity';
import { EnrollmentDataToTeacher } from './interface/enrollment-data-to-teacher.interface';
import { FilterValidationPipe } from './pipes/filter.pipe';
import { TestEnrollmentValidationPipe } from './pipes/test-enrollment.pipe';
import { TestEnrollmentService } from './test-enrollment.service';
import { isTeacher } from 'src/auth/decorator/isTeacher.decorator';
import { getExam } from './decorators/getExam.decorator';
import { Exam } from './entities/exam.entity';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('Test Enrollment Endpoints')
@Controller('testEnrollment')
export class TestEnrollmentController {
  constructor(
    private readonly testEnrollmentService: TestEnrollmentService,

    @Inject(WINSTON_MODULE_PROVIDER) 
      private readonly logger: Logger,
    ) {}
  /****GET methods*** */
  @ApiOperation({ 
    summary: 'Get Test Enrollment Indexes for Populating FrontEnd Routes' 
  })
  @Get('/')
  async getAllEnrollmentIndexes(
    @Response() res
  ){
    try {
      const testEnrollments: Partial<TestEnrollment>[] = 
        await this.testEnrollmentService.getAllEnrollmentIndexes();
      return res.status(HttpStatus.OK).json({results:testEnrollments});
    } catch (e){
      this.logger.error(`ERROR in GET /testEnrollment --- ${JSON.stringify(e)}`);
      return res
      .status(HttpStatus.INTERNAL_SERVER_ERROR)
      .json({message: "Something went wrong. Please try again!"});
    }
   
  }

  @ApiOperation({ 
    summary: 'Method for STUDENT to get their exam enrollments' 
  })
  @Get('/myTests')
  @UseGuards(AuthGuard())
  async getMyTests(
    @getUser() user: User,
    @Query(new FilterValidationPipe()) filter: FilterDto,
    @Response() res
  ){
    try {
      const testEnrollments: TestEnrollment[] =  await this.testEnrollmentService.getMyTests(user, filter);
      return res.status(HttpStatus.OK).json({results: testEnrollments});
    } catch (e){
      this.logger.error(`ERROR in GET /testEnrollment/myTests --- ${JSON.stringify(e)}`);
      return res
      .status(HttpStatus.INTERNAL_SERVER_ERROR)
      .json({message: "Something went wrong. Please try again!"});
    }
  }

  @ApiOperation({ 
    summary: 'Method for STUDENT to get the total exams' 
  })
  @Get('/myTests/count')
  @UseGuards(AuthGuard())
  async getMyTestsCount(
    @getUser() user: User,
    @getExam() exam: Exam,
    @Response() res
    ){
    try {
      const total: number = await this.testEnrollmentService.getMyTestsCount(user);
      return res.status(HttpStatus.OK).json({results: total});
    } catch (e){
      this.logger.error(`ERROR in GET /testEnrollment/myTests/count --- ${JSON.stringify(e)}`);
      return res
      .status(HttpStatus.INTERNAL_SERVER_ERROR)
      .json({message: "Something went wrong. Please try again!"});
    }
  }

  @ApiOperation({ 
    summary: 'Method to get all test scores of one exam' 
  })
  @Get('/testTakers/:examId')
  async getTestTakers(
    @Param('examId', ParseIntPipe) examId: number,
    @getExam() exam: Exam,
    @Response() res
  ){
    try {
      if(!exam) 
        return res
          .status(HttpStatus.NOT_FOUND)
          .json({message: "Exam Not Found"});
      const scores: any[] = await this.testEnrollmentService.getTestTakersScores(examId);
      return res.status(HttpStatus.OK).json({results: scores});
    } catch (e){
      this.logger.error(`ERROR in GET /testEnrollment/testTakers/:examId --- ${JSON.stringify(e)}`);
      return res
      .status(HttpStatus.INTERNAL_SERVER_ERROR)
      .json({message: "Something went wrong. Please try again!"});
    }
  }

  @ApiOperation({ 
    summary: 'Method for STUDENT to get their test result for one exam' 
  })
  @Get('/:examId')
  @UseGuards(AuthGuard())
  async getScore(
    @Param('examId', ParseIntPipe) examId: number,
    @getUser() user: User,
    @getExam() exam: Exam,
    @Response() res
  ){
    try {
      if(!exam) 
        return res
          .status(HttpStatus.NOT_FOUND)
          .json({message: "Exam Not Found"});
      const enrollment : TestEnrollment = await this.testEnrollmentService.getScore(examId, user);
      return res.status(HttpStatus.OK).json({results: enrollment});
    } catch (e){
      this.logger.error(`ERROR in GET /testEnrollment/:examId --- ${JSON.stringify(e)}`);
      return res
      .status(HttpStatus.INTERNAL_SERVER_ERROR)
      .json({message: "Something went wrong. Please try again!"});
    }
  }

  @ApiOperation({ 
    summary: 'Method for TEACHER to get information about all enrollments in one exam' 
  })
  @Get('/:examId/enrollments')
  @UseGuards(AuthGuard())
  async getAllScores(
    @getUser() user: User,
    @getExam() exam: Exam,
    @isTeacher() isTeacher: Boolean,
    @Response() res,
  ){
    try {
      if(!exam) 
        return res
          .status(HttpStatus.NOT_FOUND)
          .json({message: "Exam Not Found"});
      if(!isTeacher || exam.ownerId !== user.id) 
        return res
          .status(HttpStatus.FORBIDDEN)
          .json({message: "You are forbidden!"});
      const enrollmentData: EnrollmentDataToTeacher[] = 
        await this.testEnrollmentService.getAllScores(exam);
      return res.status(HttpStatus.OK).json({results: enrollmentData});
    } catch (e){
      this.logger.error(`ERROR in GET /testEnrollment/:examId/enrollments--- ${JSON.stringify(e)}`);
      return res
      .status(HttpStatus.INTERNAL_SERVER_ERROR)
      .json({message: "Something went wrong. Please try again!"});
    }
  }

  @ApiOperation({ 
    summary: 'Method to get exam results ' 
  })
  @Get('/:examId/enrollments/:enrollmentId')
  async getExamResult(
    @Param('enrollmentId', ParseIntPipe) enrollmentId: number,
    @getExam() exam: Exam,
    @Response() res
  ){
    try {
      if(!exam) 
        return res
          .status(HttpStatus.NOT_FOUND)
          .json({message: "Exam Not Found"});
      const examResult: {
        enrollment: TestEnrollment;
        teacherId: number;
        isPublished: boolean;
      } =  await this.testEnrollmentService.getExamResult(exam, enrollmentId);
      return res.status(HttpStatus.OK).json({results: examResult});
    } catch (e){
      this.logger.error(`ERROR in GET /testEnrollment/:examId/enrollment/:enrollmentId --- ${JSON.stringify(e)}`);
      return res
      .status(HttpStatus.INTERNAL_SERVER_ERROR)
      .json({message: "Something went wrong. Please try again!"});
    }
  }

  /****POST methods*** */
  @ApiOperation({ 
    summary: 'Method for post student test result' 
  })
  @Post('/:examId')
  @UseGuards(AuthGuard())
  async postTestScore(
    @Body(new TestEnrollmentValidationPipe())
    createTestEnrollmentDto: CreateTestEnrollmentDto,
    @getUser() user: User,
    @getExam() exam: Exam,
    @Response() res
  ){
    try {
      if(!exam) 
        return res
          .status(HttpStatus.NOT_FOUND)
          .json({message: "Exam Not Found"});
      const testEnrollment : TestEnrollment = 
        await this.testEnrollmentService.postTestScore(
        createTestEnrollmentDto,
        exam,
        user,
      );
      return res.status(HttpStatus.OK).json({results: testEnrollment});
    } catch (e){
      this.logger.error(`ERROR in POST /testEnrollment/:examId --- ${JSON.stringify(e)}`);
      return res
      .status(HttpStatus.INTERNAL_SERVER_ERROR)
      .json({message: "Something went wrong. Please try again!"});
    }
  }

  /****PUT methods*** */
  @ApiOperation({ 
    summary: 'Teacher update student test score' 
  })
  @Put('/:examId/enrollments/:enrollmentId/updateScore')
  @UseGuards(AuthGuard())
  async updateScore(
    @Body(new ValidationPipe()) body: { score: string },
    @Param('enrollmentId', ParseIntPipe) enrollmentId: number,
    @getUser() user: User,
    @getExam() exam: Exam,
    @isTeacher() isTeacher: Boolean,
    @Response() res
  ){
      try {
        if(!exam) 
          return res
            .status(HttpStatus.NOT_FOUND)
            .json({message: "Exam Not Found"});
        if(!isTeacher || exam.ownerId !== user.id) 
          return res
            .status(HttpStatus.FORBIDDEN)
            .json({message: "You are forbidden!"});
        const score = parseInt(body.score, 10);
        if (isNaN(score)) 
          return res
          .status(HttpStatus.BAD_REQUEST)
          .json({message: "Score must be a number"});
        const testEnrollment : TestEnrollment = 
           await this.testEnrollmentService.updateScore(
            parseInt(body.score),
            enrollmentId,
        );
        return res.status(HttpStatus.OK).json({results: testEnrollment});
      } catch (e){
        this.logger.error(`ERROR in PUT /testEnrollment/:examId/enrollments/:enrollmentId/updateScore 
                          --- ${JSON.stringify(e)}`);
        return res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json({message: "Something went wrong. Please try again!"});
      }
  }

  @ApiOperation({ 
    summary: 'Teacher update teacher grading' 
  })
  @Put('/:examId/enrollments/:enrollmentId/teacherGrading')
  @UseGuards(AuthGuard())
  async updateTeacherGrading(
    @Body(new ValidationPipe()) body: { teacherGrading: string },
    @Param('examId', ParseIntPipe) examId: number,
    @Param('enrollmentId', ParseIntPipe) enrollmentId: number,
    @getUser() user: User,
    @getExam() exam: Exam,
    @isTeacher() isTeacher: Boolean,
    @Response() res
  ){
    try {
      if(!exam) 
        return res
          .status(HttpStatus.NOT_FOUND)
          .json({message: "Exam Not Found"});
      if(!isTeacher || exam.ownerId !== user.id) 
        return res
          .status(HttpStatus.FORBIDDEN)
          .json({message: "You are forbidden!"});
      const testEnrollment : TestEnrollment = 
        await this.testEnrollmentService.updateTeacherGrading(
        body.teacherGrading,
        enrollmentId,
      );
      return res.status(HttpStatus.OK).json({results: testEnrollment});
    } catch (e){
      this.logger.error(`ERROR in PUT /testEnrollment/:examId/enrollments/:enrollmentId/teacherGrading
                        --- ${JSON.stringify(e)}`);
      return res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json({message: "Something went wrong. Please try again!"});
    }
  }

  /****DELETE methods*** */
  @ApiOperation({ 
    summary: 'Teacher delete test enrollment' 
  })
  @Delete('/:examId/enrollments')
  @UseGuards(AuthGuard())
  async removeTestEnrollments(
    @Param('examId', ParseIntPipe) examId: number,
    @Query('idList') idList: string,
    @getUser() user: User,
    @isTeacher() isTeacher: Boolean,
    @getExam() exam: Exam,
    @Response() res
  ) {
    try {
      if(!exam) 
        return res
          .status(HttpStatus.NOT_FOUND)
          .json({message: "Exam Not Found"});
      if(!isTeacher || exam.ownerId !== user.id) 
        return res
          .status(HttpStatus.FORBIDDEN)
          .json({message: "You are forbidden!"});
      const list = idList.split('+');
      await this.testEnrollmentService.removeTestEnrollments(
        exam,
        list,
      );
      return res
      .status(HttpStatus.OK)
      .json({message: "Test Enrollment has been removed successfully"});
    } catch (e){
      this.logger.error(`ERROR in DELETE /testEnrollment/:examId/enrollments
                        --- ${JSON.stringify(e)}`);
      return res
      .status(HttpStatus.INTERNAL_SERVER_ERROR)
      .json({message: "Something went wrong. Please try again!"});
    }
  }
}
