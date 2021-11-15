import {
  Controller,
  Get,
  Param,
  Delete,
  ParseIntPipe,
  UseGuards,
  Response,
  HttpStatus,
  Inject,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Logger } from 'winston';
import { User } from 'src/auth/entities/user.entity';
import { Exam } from '../exam/entities/exam.entity';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { TestEnrollment } from '../exam/entities/test-enrollment.entity';
import { AdminService } from './admin.service';
import { PoliciesGuard } from 'src/casl/guards/casl-policy.guard';
import { CheckPolicies } from 'src/casl/decorators/checkPolicy.decorator';
import { AdminPolicyHandler } from './policies/AdminPolicyHandler';
import { getExam } from 'src/exam/decorators/getExam.decorator';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';

@ApiTags('Admin Endpoints')
@Controller('admin')
@UseGuards(AuthGuard())
export class AdminController {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) 
    private readonly logger: Logger,

    private readonly adminService: AdminService
    ) {}

  /********************* */
  /***Users Endpoint***/
  /********************* */
  @ApiOperation({ summary: 'Get Educators List' })
  @Get('/educators')
  @UseGuards(PoliciesGuard)
  @CheckPolicies(new AdminPolicyHandler())
  async getEducators(
    @Response() res
  ): Promise<User[]> {
    try {
      const users: User[] = await this.adminService.getEducators();
      return users;
    } catch (e){
      this.logger.error(JSON.stringify(e));
      return res
      .status(HttpStatus.INTERNAL_SERVER_ERROR)
      .json({message: "Something went wrong. Please try again!"});
    }
  }

  @ApiOperation({ summary: 'Get Students List' })
  @Get('/students')
  @UseGuards(PoliciesGuard)
  @CheckPolicies(new AdminPolicyHandler())
  async getStudents(
    @Response() res
  ): Promise<User[]> {
    try {
      const users: User[] = await this.adminService.getStudents();
      return users;
    } catch (e){
      this.logger.error(JSON.stringify(e));
      return res
      .status(HttpStatus.INTERNAL_SERVER_ERROR)
      .json({message: "Something went wrong. Please try again!"});
    }
  }

  @ApiOperation({ summary: 'Delete an educator' })
  @Delete('/educators/:educatorId')
  @UseGuards(PoliciesGuard)
  @CheckPolicies(new AdminPolicyHandler())
  async deleteEducator(
    @Param('educatorId', ParseIntPipe) educatorId: number,
    @Response() res
  ): Promise<User[]> {
    try {
      const users: User[] = await this.adminService.deleteEducator(educatorId);
      return users;
    } catch (e){
      this.logger.error(JSON.stringify(e));
      return res
      .status(HttpStatus.INTERNAL_SERVER_ERROR)
      .json({message: "Something went wrong. Please try again!"});
    }
  }

  @ApiOperation({ summary: 'Delete a student' })
  @Delete('/students/:studentId')
  @UseGuards(PoliciesGuard)
  @CheckPolicies(new AdminPolicyHandler())
  async deleteStudent(
    @Param('studentId', ParseIntPipe) studentId: number,
    @Response() res
  ): Promise<User[]> {
    try {
      const users: User[] = await this.adminService.deleteStudent(studentId);
      return users;
    } catch (e){
      this.logger.error(JSON.stringify(e));
      return res
      .status(HttpStatus.INTERNAL_SERVER_ERROR)
      .json({message: "Something went wrong. Please try again!"});
    }
  }
  /********************* */
  /***Exams***/
  /********************* */
  @ApiOperation({ summary: 'Get Exams by Educator' })
  @Get('/educators/:educatorId/exams')
  @UseGuards(PoliciesGuard)
  @CheckPolicies(new AdminPolicyHandler())
  async getExamsByEducator(
    @Param('educatorId', ParseIntPipe) educatorId: number,
    @Response() res
  ): Promise<Exam[]> {
    try {
      const exams: Exam[] = await this.adminService.getExamsByEducator(educatorId);
      return exams;
    } catch (e){
      this.logger.error(JSON.stringify(e));
      return res
      .status(HttpStatus.INTERNAL_SERVER_ERROR)
      .json({message: "Something went wrong. Please try again!"});
    }
  }

  @ApiOperation({ summary: 'Get Exam' })
  @Get('/exams/:examId')
  @UseGuards(PoliciesGuard)
  @CheckPolicies(new AdminPolicyHandler())
  async getExam(
    @Param('examId', ParseIntPipe) examId: number,
    @Response() res
    ): Promise<Exam> {
    try {
      const exam: Exam =  await this.adminService.getExam(examId);
      if(!exam) 
        return res
        .status(HttpStatus.NOT_FOUND)
        .json({message: "Exam Not Found"});
      return exam;
    } catch (e){
      this.logger.error(JSON.stringify(e));
      return res
      .status(HttpStatus.INTERNAL_SERVER_ERROR)
      .json({message: "Something went wrong. Please try again!"});
    }
  }

  @ApiOperation({ summary: 'Delete Exam' })
  @Delete('/exams/:examId')
  @UseGuards(PoliciesGuard)
  @CheckPolicies(new AdminPolicyHandler())
  async deleteExam(
    @Param('examId', ParseIntPipe) examId: number,
    @Response() res
  ): Promise<Exam[]> {
    try {
      const exams: Exam[] =  await this.adminService.deleteExam(examId);
      return exams;
    } catch (e){
      this.logger.error(JSON.stringify(e));
      return res
      .status(HttpStatus.INTERNAL_SERVER_ERROR)
      .json({message: "Something went wrong. Please try again!"});
    }
  }

  /********************* */
  /***Exam Enrollment***/
  /********************* */
  @ApiOperation({ summary: 'Get Exam Enrollments By Student' })
  @Get('/students/:studentId/enrollments')
  @UseGuards(PoliciesGuard)
  @CheckPolicies(new AdminPolicyHandler())
  async getEnrollmentsByUser(
    @Param('studentId', ParseIntPipe) studentId: number,
    @Response() res
  ): Promise<TestEnrollment[]> {
    try {
      const testEnrollments : TestEnrollment[] =  await this.adminService.getEnrollmentsByUser(studentId);
      return testEnrollments;
    } catch (e){
      this.logger.error(JSON.stringify(e));
      return res
      .status(HttpStatus.INTERNAL_SERVER_ERROR)
      .json({message: "Something went wrong. Please try again!"});
    }
  }

  @ApiOperation({ summary: 'Delete Exam Enrollment' })
  @Delete('/exams/:examId/enrollments/:enrollmentId')
  @UseGuards(PoliciesGuard)
  @CheckPolicies(new AdminPolicyHandler())
  async deleteEnrollment(
    @Param('enrollmentId', ParseIntPipe) enrollmentId: number,
    @getExam() exam: Exam,
    @Response() res
  ) {
    try {
      if(!exam) return res.status(HttpStatus.NOT_FOUND).json({message: "Exam Not Found"});
      await this.adminService.deleteEnrollment(enrollmentId, exam);
      return res
        .status(HttpStatus.OK)
        .json({message: "Test Enrollment has been deleted successfully"});
    } catch (e){
      this.logger.error(JSON.stringify(e));
      return res
      .status(HttpStatus.INTERNAL_SERVER_ERROR)
      .json({message: "Something went wrong. Please try again!"});
    }
  }
}
