import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/auth/entities/user.entity';
import { CreateTestEnrollmentDto } from './dto/create-test-enrollment.dto';
import { TestEnrollment } from './entities/test-enrollment.entity';
import { ExamService } from './exam.service';
import { TestEnrollmentRepository } from './test-enrollment.repository';

@Injectable()
export class TestEnrollmentService {
  constructor(
    @InjectRepository(TestEnrollmentRepository)
    private testEnrollmentRepository: TestEnrollmentRepository,
    private examService: ExamService,
  ) {}
  async getTestTakersScores(examId: number) {
    return await this.testEnrollmentRepository.getTestTakersScores(examId);
  }
  async getMyTests(user: User) {
    return await this.testEnrollmentRepository.getMyTest(user);
  }
  async postTestScore(
    createTestEnrollmentDto: CreateTestEnrollmentDto,
    examId: number,
    user: User,
  ): Promise<TestEnrollment> {
    const { exam, sections } = await this.examService.getExamForTestTaker(
      examId,
    );
    if (!exam) throw new NotFoundException('Exam Not Found');
    return await this.testEnrollmentRepository.postTestScore(
      createTestEnrollmentDto,
      exam,
      user,
    );
  }

  async getAllScores(examId: number): Promise<TestEnrollment[]> {
    return await this.testEnrollmentRepository.getAllScores(examId);
  }
  async getScore(examId: number, user: User): Promise<TestEnrollment> {
    return await this.testEnrollmentRepository.getScore(examId, user);
  }
  async getExamResult(enrollmentId: number): Promise<TestEnrollment> {
    return await this.testEnrollmentRepository.getExamResult(enrollmentId);
  }
}
