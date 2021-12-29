import {
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { User } from 'src/auth/entities/user.entity';
import { EntityRepository, getConnection, Repository } from 'typeorm';
import { CreateTestEnrollmentDto } from '../dto/create-test-enrollment.dto';
import { Exam } from '../entities/exam.entity';
import { TestEnrollment } from '../entities/test-enrollment.entity';
import { EnrollmentDataToTeacher } from '../interface/enrollment-data-to-teacher.interface';
import { FilterDto } from '../dto/filter.dto';

@EntityRepository(TestEnrollment)
export class TestEnrollmentRepository extends Repository<TestEnrollment> {
  /************READ**********/
  async getAllEnrollmentIndexes(): Promise<Partial<TestEnrollment>[]> {
    return await this.createQueryBuilder('e')
      .select('e.id')
      .addSelect('e.examId')
      .addSelect('e.subjectId')
      .getMany();
  }
  async getTestTakersScores(examId: number) {
    try {
      const enrollments: TestEnrollment[] = await this.createQueryBuilder('e')
        .innerJoinAndSelect('e.student', 'user', 'user.id = e.studentId')
        .where('e.examId = :examId', { examId })
        .getMany();
      const results = [];
      enrollments.forEach((e) => {
        const temp = {
          name: `${e.student.firstName} ${e.student.lastName}`,
          score: e.score || null,
        };
        results.push(temp);
      });
      return results;
    } catch (e) {
      throw new InternalServerErrorException(e);
    }
  }
  async getMyTests(user: User, filter: FilterDto) {
    try {
      const { limit, offset } = filter;
      const enrollments: TestEnrollment[] = await this.createQueryBuilder('e')
        .innerJoinAndSelect('e.exam', 'exam', 'exam.id = e.examId')
        .where('e.studentId = :studentId', { studentId: user.id })
        .offset(offset)
        .limit(limit)
        .getMany();
      return enrollments;
    } catch (e) {
      throw new InternalServerErrorException(e);
    }
  }

  async getMyTestCount(user: User): Promise<number> {
    try {
      const enrollments: TestEnrollment[] = await this.find({
        where: { studentId: user.id },
      });
      return enrollments.length;
    } catch (e) {
      throw new InternalServerErrorException(e);
    }
  }

  async getScore(examId: number, user: User): Promise<TestEnrollment> {
    const enrollment: TestEnrollment = await this.findOne({
      where: { examId, studentId: user.id },
    });
    if (!enrollment)
      throw new NotFoundException("You haven't enrolled in the exam");
    else {
      delete enrollment.exam;
      delete enrollment.student;
      return enrollment;
    }
  }

  async getAllScores(examId: number): Promise<EnrollmentDataToTeacher[]> {
    try {
      const enrollments: TestEnrollment[] = await this.createQueryBuilder('e')
        .innerJoinAndSelect('e.student', 'user', 'user.id = e.studentId')
        .where('e.examId = :examId', { examId })
        .getMany();
      const results: EnrollmentDataToTeacher[] = [];
      enrollments.forEach((e: TestEnrollment) => {
        const item: EnrollmentDataToTeacher = {
          id: e.id,
          email: e.student.email,
          name: e.student.firstName + ' ' + e.student.lastName,
          lastAttempt: e.updatedBy,
          noOfAttempt: e.timeTaken,
          score: e.score,
          totalScore: e.totalScore,
          didTeacherComment: Boolean(e.teacherGrading),
        };
        results.push(item);
      });
      return results;
    } catch (e) {
      throw new InternalServerErrorException(e);
    }
  }

  async getExamResult(enrollmentId: number): Promise<TestEnrollment> {
    try {
      const enrollment: TestEnrollment = await this.findOne(enrollmentId);
      return enrollment;
    } catch (e) {
      throw new InternalServerErrorException(e);
    }
  }
  /************CREATE**********/
  async postTestScore(
    createTestEnrollmentDto: CreateTestEnrollmentDto,
    exam: Exam,
    user: User,
  ): Promise<TestEnrollment> {
    const { score, totalScore, answerObj, sectionsObj } =
      createTestEnrollmentDto;
    const enrollment: TestEnrollment = await this.findOne({
      where: { examId: exam.id, studentId: user.id },
    });
    if (!enrollment) {
      const newEnrollment = new TestEnrollment();
      newEnrollment.exam = exam;
      newEnrollment.subjectId = exam.subject;
      newEnrollment.student = user;
      newEnrollment.totalScore = totalScore;
      if (score || score === 0) newEnrollment.score = score;
      newEnrollment.answerObj = answerObj;
      newEnrollment.sectionsObj = sectionsObj;
      newEnrollment.timeTaken = 1;
      await newEnrollment.save();
      delete newEnrollment.exam;
      delete newEnrollment.student;
      //Update TestTaker
      await getConnection()
        .createQueryBuilder()
        .update(Exam)
        .set({
          testTakers: exam.testTakers + 1,
        })
        .where('id = :examId', { examId: exam.id })
        .execute();
    } else {
      const subject = exam.subject;
      // Student's speaking answer will container recording audio url,
      // so old audio urls must be removed
      if (subject === 3) {
        const urlArr = [];
        const answers = JSON.parse(enrollment.answerObj);
        for (const a in answers) {
          if (answers.hasOwnProperty(a) && answers[a].userAnswer[0])
            urlArr.push(answers[a].userAnswer[0]);
        }
        const filenameArr: string[] = [];
        for (const url of urlArr) {
          if (!url.includes('/')) {
            const filename = url;
            if (filename) filenameArr.push(filename);
          }
        }
        if (filenameArr.length > 0) {
          const { batchDeleteAudio } = require('../../shared/helpers');
          await batchDeleteAudio(filenameArr);
        }
      }
      enrollment.timeTaken++;
      if (score || score === 0) enrollment.score = score;
      enrollment.totalScore = totalScore;
      enrollment.answerObj = answerObj;
      enrollment.sectionsObj = sectionsObj;
      await enrollment.save();
    }
    return await this.getScore(exam.id, user);
  }
  /************UPDATE**********/
  async updateEnrollment(
    payload: { score?: number; teacherGrading?: string },
    enrollmentId: number,
  ): Promise<TestEnrollment> {
    const testEnrollment = await this.findOne(enrollmentId);
    if (!testEnrollment)
      throw new Error(
        "The student hasn't taken the test. The enrollment is not found.",
      );
    if (payload.score || payload.score === 0)
      testEnrollment.score = payload.score;
    if (payload.teacherGrading)
      testEnrollment.teacherGrading = payload.teacherGrading;
    await testEnrollment.save();
    return testEnrollment;
  }
  /************DELETE**********/
  async removeEnrollments(subject: number, list: string[]) {
    try {
      // If this is Enrollment Record for speaking test, the recording audio urls need to be removed
      if (subject === 3) {
        for (const id of list) {
          const enrollment: TestEnrollment = await this.findOne(id);
          if (enrollment) {
            const urlArr = [];
            const answers = JSON.parse(enrollment.answerObj);
            for (const a in answers) {
              if (answers.hasOwnProperty(a) && answers[a].userAnswer[0])
                urlArr.push(answers[a].userAnswer[0]);
            }
            const filenameArr: string[] = [];
            for (const url of urlArr) {
              if (!url.includes('/')) {
                const filename = url;
                if (filename) filenameArr.push(filename);
              }
            }
            if (filenameArr.length > 0) {
              const { batchDeleteAudio } = require('../../shared/helpers');
              await batchDeleteAudio(filenameArr);
            }
          }
        }
      }
      // Remove the enrollment
      return await getConnection()
        .createQueryBuilder()
        .delete()
        .from(TestEnrollment)
        .where('id IN (:...Ids)', { Ids: [...list] })
        .execute();
    } catch (e) {
      throw new InternalServerErrorException(e);
    }
  }
}
