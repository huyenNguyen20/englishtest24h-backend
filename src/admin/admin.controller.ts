import {
  Controller,
  Get,
  Param,
  Delete,
  ParseIntPipe,
  UseGuards,
  Response,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { getUser } from 'src/auth/decorator/getUser.decorator';
import { User } from 'src/auth/entities/user.entity';
import { Exam } from '../exam/entities/exam.entity';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { TestEnrollment } from '../exam/entities/test-enrollment.entity';
import { AdminService } from './admin.service';
import { PoliciesGuard } from 'src/casl/guards/casl-policy.guard';
import { CheckPolicies } from 'src/casl/decorators/checkPolicy.decorator';
import { AdminPolicyHandler } from './policies/AdminPolicyHandler';

@ApiTags('Admin Endpoints')
@Controller('admin')
@UseGuards(AuthGuard())
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  /********************* */
  /***Users Endpoint***/
  /********************* */
  @ApiOperation({ summary: 'Get Educators List' })
  @Get('/educators')
  @UseGuards(PoliciesGuard)
  @CheckPolicies(new AdminPolicyHandler())
  async getEducators(): Promise<User[]> {
    return await this.adminService.getEducators();
  }

  @ApiOperation({ summary: 'Get Students List' })
  @Get('/students')
  @UseGuards(PoliciesGuard)
  @CheckPolicies(new AdminPolicyHandler())
  async getStudents(): Promise<User[]> {
    return await this.adminService.getStudents();
  }

  @ApiOperation({ summary: 'Delete an educator' })
  @Delete('/educators/:educatorId')
  @UseGuards(PoliciesGuard)
  @CheckPolicies(new AdminPolicyHandler())
  async deleteEducator(
    @Param('educatorId', ParseIntPipe) educatorId: number,
  ): Promise<User[]> {
    return await this.adminService.deleteEducator(educatorId);
  }

  @ApiOperation({ summary: 'Delete a student' })
  @Delete('/students/:studentId')
  @UseGuards(PoliciesGuard)
  @CheckPolicies(new AdminPolicyHandler())
  async deleteStudent(
    @Param('studentId', ParseIntPipe) studentId: number,
  ): Promise<User[]> {
    return await this.adminService.deleteStudent(studentId);
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
  ): Promise<Exam[]> {
    return await this.adminService.getExamsByEducator(educatorId);
  }

  @ApiOperation({ summary: 'Get Exam' })
  @Get('/exams/:examId')
  @UseGuards(PoliciesGuard)
  @CheckPolicies(new AdminPolicyHandler())
  async getExam(@Param('examId', ParseIntPipe) examId: number): Promise<Exam> {
    return await this.adminService.getExam(examId);
  }

  @ApiOperation({ summary: 'Delete Exam' })
  @Delete('/exams/:examId')
  @UseGuards(PoliciesGuard)
  @CheckPolicies(new AdminPolicyHandler())
  async deleteExam(
    @Param('examId', ParseIntPipe) examId: number,
  ): Promise<Exam[]> {
    return await this.adminService.deleteExam(examId);
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
  ): Promise<TestEnrollment[]> {
    return await this.adminService.getEnrollmentsByUser(studentId);
  }

  @ApiOperation({ summary: 'Delete Exam Enrollment' })
  @Delete('/exams/:examId/enrollments/:enrollmentId')
  @UseGuards(PoliciesGuard)
  @CheckPolicies(new AdminPolicyHandler())
  async deleteEnrollment(
    @Param('examId', ParseIntPipe) examId: number,
    @Param('enrollmentId', ParseIntPipe) enrollmentId: number,
  ) {
    return await this.adminService.deleteEnrollment(enrollmentId, examId);
  }
}
