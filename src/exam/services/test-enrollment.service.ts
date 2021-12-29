import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/auth/entities/user.entity';
import { CreateTestEnrollmentDto } from '../dto/create-test-enrollment.dto';
import { FilterDto } from '../dto/filter.dto';
import { Exam } from '../entities/exam.entity';
import { TestEnrollment } from '../entities/test-enrollment.entity';
import { EnrollmentDataToTeacher } from '../interface/enrollment-data-to-teacher.interface';
import { TestEnrollmentRepository } from '../repositories/test-enrollment.repository';

@Injectable()
export class TestEnrollmentService {
  constructor(
    @InjectRepository(TestEnrollmentRepository)
    private testEnrollmentRepository: TestEnrollmentRepository,
  ) {}
  /************************************* */
  /****Students and Educators Methods*** */
  /************************************* */
  /********READ******** */
  //Indexing frontend routes
  async getAllEnrollmentIndexes(): Promise<Partial<TestEnrollment>[]> {
    return await this.testEnrollmentRepository.getAllEnrollmentIndexes();
  }
  async getTestTakersScores(examId: number) {
    return await this.testEnrollmentRepository.getTestTakersScores(examId);
  }
  // Get Past Exams for STUDENTS
  async getMyTests(user: User, filter: FilterDto) {
    return await this.testEnrollmentRepository.getMyTests(user, filter);
  }
  // Get Total Past Exams for STUDENTS
  async getMyTestsCount(user: User): Promise<number> {
    return await this.testEnrollmentRepository.getMyTestCount(user);
  }
  // Get all enrollment records for TEACHERS
  async getAllScores(exam: Exam): Promise<EnrollmentDataToTeacher[]> {
    return await this.testEnrollmentRepository.getAllScores(exam.id);
  }
  // Check if the student has taken test for STUDENT
  async getScore(examId: number, user: User): Promise<TestEnrollment> {
    return await this.testEnrollmentRepository.getScore(examId, user);
  }

  // Get student's past exam review for STUDENT and TEACHER
  async getExamResult(
    exam: Exam,
    enrollmentId: number,
  ): Promise<{
    enrollment: TestEnrollment;
    teacherId: number;
    isPublished: boolean;
  }> {
    const enrollment: TestEnrollment =
      await this.testEnrollmentRepository.getExamResult(enrollmentId);
    return {
      enrollment,
      teacherId: exam.ownerId,
      isPublished: exam.isPublished,
    };
  }

  /********CREATE ******** */
  // Post and update the student's answers and score for STUDENT
  async postTestScore(
    createTestEnrollmentDto: CreateTestEnrollmentDto,
    exam: Exam,
    user: User,
  ): Promise<TestEnrollment> {
    return await this.testEnrollmentRepository.postTestScore(
      createTestEnrollmentDto,
      exam,
      user,
    );
  }

  /********UPDATE******** */
  // Update student's score for TEACHER
  async updateScore(
    score: number,
    enrollmentId: number,
  ): Promise<TestEnrollment> {
    try {
      // Update TestEnrollment
      return this.testEnrollmentRepository.updateEnrollment(
        { score },
        enrollmentId,
      );
    } catch (e) {
      throw new InternalServerErrorException(e);
    }
  }
  // Update teacher grading of the exam for TEACHER
  async updateTeacherGrading(
    teacherGrading: string,
    enrollmentId: number,
  ): Promise<TestEnrollment> {
    // Update TestEnrollment
    return this.testEnrollmentRepository.updateEnrollment(
      { teacherGrading },
      enrollmentId,
    );
  }

  /********DELETE******** */
  // Remove a student's enrollment record by TEACHER
  async removeTestEnrollments(exam: Exam, list: string[]) {
    // Update TestEnrollment
    return await this.testEnrollmentRepository.removeEnrollments(
      exam.subject,
      list,
    );
  }

  /************************************* */
  /****Admin Methods*** */
  /************************************* */
  async getEnrollmentsByUser(studentId: number): Promise<TestEnrollment[]> {
    return await this.testEnrollmentRepository.find({
      where: { studentId },
    });
  }

  async deleteEnrollmentForAdmin(enrollmentId: number, exam: Exam) {
    // Update TestEnrollment
    return await this.testEnrollmentRepository.removeEnrollments(exam.subject, [
      `${enrollmentId}`,
    ]);
  }
}
