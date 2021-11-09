import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/auth/entities/user.entity';
import { FilterExamDto } from './dto';
import { CreateTestEnrollmentDto } from './dto/create-test-enrollment.dto';
import { TestEnrollment } from './entities/test-enrollment.entity';
import { ExamRepository } from './exam.repositary';
import { EnrollmentDataToTeacher } from './interface/enrollment-data-to-teacher.interface';
import { TestEnrollmentRepository } from './test-enrollment.repository';

@Injectable()
export class TestEnrollmentService {
  constructor(
    @InjectRepository(TestEnrollmentRepository)
    private testEnrollmentRepository: TestEnrollmentRepository,
    private examRepository: ExamRepository,
  ) {}
  /********READ******** */
  //Indexing frontend routes
  async getAllEnrollmentIndexes(): Promise<Partial<TestEnrollment>[]> {
    return await this.testEnrollmentRepository.getAllEnrollmentIndexes();
  }
  async getTestTakersScores(examId: number) {
    return await this.testEnrollmentRepository.getTestTakersScores(examId);
  }
  // Get Past Exams for STUDENTS
  async getMyTests(user: User, filter: Partial<FilterExamDto>) {
    return await this.testEnrollmentRepository.getMyTest(user, filter);
  }
  // Get Total Past Exams for STUDENTS
  async getMyTestsCount(user: User): Promise<number> {
    return await this.testEnrollmentRepository.getMyTestCount(user);
  }
  // Get all enrollment records for TEACHERS
  async getAllScores(examId: number, user: User): Promise<EnrollmentDataToTeacher[]> {
    try{
      const exam = await this.examRepository.findOne(examId);
      if(!exam || exam.ownerId !== user.id) throw new ForbiddenException("You are not allowed to access the endpoint");
      return await this.testEnrollmentRepository.getAllScores(examId);
    } catch (e) {
      return e;
    }
  }
  // Check if the student has taken test for STUDENT
  async getScore(examId: number, user: User): Promise<TestEnrollment> {
    return await this.testEnrollmentRepository.getScore(examId, user);
  }

  // Get student's past exam review for STUDENT and TEACHER
  async getExamResult(examId: number, enrollmentId: number)
  : Promise<{enrollment: TestEnrollment; teacherId: number, isPublished: boolean}> {
    try {
      const exam = await this.examRepository.findOne(examId);
      if(!exam) throw new NotFoundException("Exam Not Found");
      const enrollment = await this.testEnrollmentRepository.getExamResult(enrollmentId);
      return {enrollment, teacherId: exam.ownerId, isPublished: exam.isPublished}
    } catch(e){
      return e;
    }
  }

   /********CREATE ******** */
   // Post and update the student's answers and score for STUDENT
  async postTestScore(
    createTestEnrollmentDto: CreateTestEnrollmentDto,
    examId: number,
    user: User,
  ): Promise<TestEnrollment> {
    const exam= await this.examRepository.findOne(examId);
    if (!exam) throw new NotFoundException('Exam Not Found');
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
    examId: number, 
    enrollmentId: number, 
    user: User) : Promise<TestEnrollment> {
    try {
      // Check the user permission
      const exam = await this.examRepository.findOne(examId);
      if((!exam) || (exam.ownerId !== user.id)) throw new ForbiddenException("You have no permission to perform the task");
      // Update TestEnrollment
      return this.testEnrollmentRepository.updateEnrollment({score}, enrollmentId);
    } catch (e) {
      throw e;
    }
  }
  // Update teacher grading of the exam for TEACHER
  async updateTeacherGrading(
    teacherGrading: string, 
    examId: number, 
    enrollmentId: number, 
    user: User) : Promise<TestEnrollment> {
    try {
      // Check the user permission
      const exam = await this.examRepository.findOne(examId);
      if((!exam) || (exam.ownerId !== user.id)) throw new ForbiddenException("You have no permission to perform the task");
      // Update TestEnrollment
      return this.testEnrollmentRepository.updateEnrollment({teacherGrading}, enrollmentId);
    } catch (e) {
      throw e;
    }
  }

   /********DELETE******** */
   // Remove a student's enrollment record by TEACHER
  async removeTestEnrollments(
    examId: number,
    list: string[],
    user: User,
  ){
    try {
      // Check the user permission
      const exam = await this.examRepository.findOne(examId);
      if((!exam) || (exam.ownerId !== user.id)) throw new ForbiddenException("You have no permission to perform the task");
      // Update TestEnrollment
      return await this.testEnrollmentRepository.removeEnrollments(exam, list);
    } catch (e) {
      throw e;
    }
  }
  
}
