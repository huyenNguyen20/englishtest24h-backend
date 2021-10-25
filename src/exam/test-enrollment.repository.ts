import { BadRequestException, NotFoundException } from '@nestjs/common';
import { User } from 'src/auth/entities/user.entity';
import { EntityRepository, getConnection, Repository } from 'typeorm';
import { CreateTestEnrollmentDto } from './dto/create-test-enrollment.dto';
import { Exam } from './entities/exam.entity';
import { TestEnrollment } from './entities/test-enrollment.entity';
import * as config from 'config';
import axios from 'axios';

@EntityRepository(TestEnrollment)
export class TestEnrollmentRepository extends Repository<TestEnrollment> {
  async getAllEnrollmentIndexes(): Promise<Partial<TestEnrollment>[]> {
    return await this.createQueryBuilder('e')
      .select('e.id')
      .addSelect('e.examId')
      .addSelect('e.subjectId')
      .getMany();
  }
  async getTestTakersScores(examId: number) {
    try {
      const enrollments = await this.createQueryBuilder('e')
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
      console.log(e);
      throw new BadRequestException();
    }
  }
  async getMyTest(user: User) {
    try {
      const enrollments = await this.createQueryBuilder('e')
        .innerJoinAndSelect('e.exam', 'exam', 'exam.id = e.examId')
        .where('e.studentId = :studentId', { studentId: user.id })
        .getMany();
      return enrollments;
    } catch (e) {
      console.log(e);
      throw new BadRequestException();
    }
  }
  async postTestScore(
    createTestEnrollmentDto: CreateTestEnrollmentDto,
    exam: Exam,
    user: User,
  ): Promise<TestEnrollment> {
    const { score, totalScore, answerObj, sectionsObj } = createTestEnrollmentDto;
    const enrollment = await this.findOne({
      where: { examId: exam.id, studentId: user.id },
    });
    if (!enrollment) {
      const newEnrollment = new TestEnrollment();
      newEnrollment.exam = exam;
      newEnrollment.subjectId = exam.subject;
      newEnrollment.student = user;
      newEnrollment.totalScore = totalScore;
      if(score || score === 0) newEnrollment.score = score;
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
      if (subject === 3) {
        const urlArr = [];
        const answers = JSON.parse(enrollment.answerObj);
        for (const a in answers) {
          if (answers.hasOwnProperty(a) && answers[a].userAnswer[0])
            urlArr.push(answers[a].userAnswer[0]);
        }
        for (const url of urlArr) {
          const filename = url.substring(url.lastIndexOf('/') + 1);
          const audioPath = `${config.get('deleteAudio').url}/${filename}`;
          await axios.delete(audioPath);
        }
      }
      enrollment.timeTaken++;
      if(score || score === 0) enrollment.score = score;
      enrollment.totalScore = totalScore;
      enrollment.answerObj = answerObj;
      enrollment.sectionsObj = sectionsObj;
      await enrollment.save();
    }
    return await this.getScore(exam.id, user);
  }

  async updateEnrollment(payload: {score?:number, teacherGrading?: string}, enrollmentId: number): Promise<TestEnrollment>{
    try {
      const testEnrollment = await this.findOne(enrollmentId);
      if(!testEnrollment) throw new Error("The student hasn't taken the test. The enrollment is not found.");
      if(payload.score || payload.score === 0) testEnrollment.score = payload.score;
      if(payload.teacherGrading) testEnrollment.teacherGrading = payload.teacherGrading;
      await testEnrollment.save();
      return testEnrollment;
    } catch (e){
      throw e;
    }
  }
  async getScore(examId: number, user: User): Promise<TestEnrollment> {
    try {
      const enrollment = await this.findOne({
        where: { examId, studentId: user.id },
      });
      if (!enrollment)
        throw new NotFoundException("You haven't enrolled in the exam");
      else {
        delete enrollment.exam;
        delete enrollment.student;
        return enrollment;
      }
    } catch (e) {
      throw new NotFoundException("You haven't enrolled in the exam");
    }
  }

  async getAllScores(examId: number): Promise<TestEnrollment[]> {
    try {
      const enrollments = await this.find({ where: { examId } });
      return enrollments;
    } catch (e) {
      throw new NotFoundException("You haven't enrolled in the exam");
    }
  }

  async getExamResult(enrollmentId: number): Promise<TestEnrollment> {
    try {
      const enrollment = await this.findOne(enrollmentId);
      return enrollment;
    } catch (e) {
      throw new NotFoundException("You haven't enrolled in the exam");
    }
  }
}
