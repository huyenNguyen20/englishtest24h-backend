import {
    Controller,
    Get,
    Param,
    Delete,
    ParseIntPipe,
    UseGuards,
  } from '@nestjs/common';
  import { ExamService } from '../exam/exam.service';
  import { AuthGuard } from '@nestjs/passport';
  import { getUser } from 'src/auth/decorator/getUser.decorator';
  import { User } from 'src/auth/entities/user.entity';
  import { Exam } from '../exam/entities/exam.entity';
  import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { TestEnrollment } from '../exam/entities/test-enrollment.entity';
import { AdminService } from './admin.service';
  
  @ApiTags('Admin Endpoints')
  @Controller('admin')
  export class AdminController {
    constructor(private readonly adminService: AdminService) {}
  
    /********************* */
    /***Users Endpoint***/
    /********************* */
    @ApiOperation({ summary: 'Get Educators List' })
    @Get('/educators')
    @UseGuards(AuthGuard())
    async getEducator(
       @getUser() user: User,
    ): Promise<User[]> {
      return await this.adminService.getEducators(user);
    }
  
    @ApiOperation({ summary: 'Get Students List' })
    @Get('/students')
    @UseGuards(AuthGuard())
    async getStudents(
       @getUser() user: User,
    ): Promise<User[]> {
      return await this.adminService.getStudents(user);
    }
    
    @ApiOperation({ summary: 'Delete an educator' })
    @Delete('/educators/:educatorId')
    @UseGuards(AuthGuard())
    async deleteEducator(
       @Param('educatorId', ParseIntPipe) educatorId : number,
       @getUser() user: User,
    ): Promise<User[]> {
      return await this.adminService.deleteEducator(user, educatorId);
    }

    @ApiOperation({ summary: 'Delete a student' })
    @Delete('/students/:studentId')
    @UseGuards(AuthGuard())
    async deleteStudent(
       @Param('studentId', ParseIntPipe) studentId : number,
       @getUser() user: User,
    ): Promise<User[]> {
      return await this.adminService.deleteStudent(user, studentId);
    }
    /********************* */
    /***Exams***/
    /********************* */
    @ApiOperation({ summary: 'Get Exams by Educator' })
    @Get("/educators/:educatorId/exams")
    @UseGuards(AuthGuard())
    async getExamsByEducator(
      @Param('educatorId', ParseIntPipe) educatorId: number,
      @getUser() user: User,
    ): Promise<Exam[]> {
      return await this.adminService.getExamsByEducator(user, educatorId);
    }
    
    @ApiOperation({ summary: 'Get Exam' })
    @Get("/exams/:examId")
    @UseGuards(AuthGuard())
    async getExam(
      @Param('examId', ParseIntPipe) examId: number,
      @getUser() user: User,
    ): Promise<Exam> {
      return await this.adminService.getExam(user, examId);
    }
    
    @ApiOperation({ summary: 'Delete Exam' })
    @Delete("/exams/:examId")
    @UseGuards(AuthGuard())
    async deleteExam(
      @Param('examId', ParseIntPipe) examId: number,
      @getUser() user: User,
    ): Promise<Exam[]> {
      return await this.adminService.deleteExam(user, examId);
    }

    /********************* */
    /***Exam Enrollment***/
    /********************* */
    @ApiOperation({ summary: 'Get Exam Enrollments By Student' })
    @Get('/students/:studentId/enrollments')
    @UseGuards(AuthGuard())
    async getEnrollmentsByUser(
        @Param('studentId', ParseIntPipe) studentId: number,
       @getUser() user: User,
    ): Promise<TestEnrollment[]> {
      return await this.adminService.getEnrollmentsByUser(user, studentId);
    }

    @ApiOperation({ summary: 'Delete Exam Enrollment' })
    @Delete('/enrollments/:enrollmentId')
    @UseGuards(AuthGuard())
    async deleteEnrollment(
       @Param('studentId', ParseIntPipe) studentId: number,
       @getUser() user: User,
    ): Promise<TestEnrollment[]> {
      return await this.adminService.deleteEnrollment(user, studentId);
    }
  }
  