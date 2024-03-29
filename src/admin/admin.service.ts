import { Injectable } from '@nestjs/common';
import { AuthService } from '../auth/auth.service';
import { User } from '../auth/entities/user.entity';
import { TestEnrollment } from '../exam/entities/test-enrollment.entity';
import { ExamService } from '../exam/services/exam.service';
import { TestEnrollmentService } from '../exam/services/test-enrollment.service';
import { Exam } from '../exam/entities/exam.entity';

@Injectable()
export class AdminService {
  constructor(
    private readonly authService: AuthService,
    private readonly examService: ExamService,
    private readonly testEnrollmentService: TestEnrollmentService,
  ) {}
  /********************* */
  /***Users Endpoint***/
  /********************* */
  async getEducators(): Promise<User[]> {
    return await this.authService.getEducators();
  }

  async getStudents(): Promise<User[]> {
    return await this.authService.getStudents();
  }

  async deleteEducator(educatorId: number): Promise<User[]> {
    return await this.authService.deleteEducator(educatorId);
  }

  async deleteStudent(studentId: number): Promise<User[]> {
    return await this.authService.deleteStudent(studentId);
  }

  /********************* */
  /***Exams***/
  /********************* */
  async getExamsByEducator(educatorId: number): Promise<Exam[]> {
    return await this.examService.getExamsByEducator(educatorId);
  }

  async getExam(examId: number): Promise<Exam> {
    return await this.examService.getExamForAdmin(examId);
  }

  async deleteExam(examId: number): Promise<Exam[]> {
    return await this.examService.deleteExamForAdmin(examId);
  }

  /********************* */
  /***Exam Enrollment***/
  /********************* */
  async getEnrollmentsByUser(studentId: number): Promise<TestEnrollment[]> {
    return await this.testEnrollmentService.getEnrollmentsByUser(studentId);
  }

  async deleteEnrollment(enrollmentId: number, exam: Exam) {
    return await this.testEnrollmentService.deleteEnrollmentForAdmin(
      enrollmentId,
      exam,
    );
  }
}
