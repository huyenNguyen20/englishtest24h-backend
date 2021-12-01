import { Exam, Subjects } from './entities/exam.entity';
import { EntityRepository, getConnection, Like, Repository } from 'typeorm';
import { CreateExamDto, FilterExamDto, UpdateExamDto } from './dto';
import { User } from 'src/auth/entities/user.entity';
import {
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { Question } from './entities/question.entity';
import { StudentQuestion } from '../studentQuestion/entities/question.entity';
import { TestEnrollment } from './entities/test-enrollment.entity';
import { Section } from './entities/section.entity';
import { QuestionGroup } from './entities/questionGroup.entity';
import { Answer } from './entities/answer.entity';

@EntityRepository(Exam)
export class ExamRepository extends Repository<Exam> {
  /****Exams Methods for Public Users*** */
  async getPublishedExamIndexes(): Promise<Partial<Exam>[]> {
    return await this.createQueryBuilder('exam')
      .select('exam.id')
      .addSelect('exam.title')
      .addSelect('exam.subject')
      .where('exam.isPublished = :value', { value: true })
      .getMany();
  }

  async getPublishedExams(filterExamDto: FilterExamDto): Promise<Exam[]> {
    const query = this.createQuery(true, null, filterExamDto);
    return await query.getMany();
  }

  async getPublishedExamsCount(): Promise<number> {
    try {
      const total: Exam[] = await this.find({ where: { isPublished: true } });
      return total.length;
    } catch (e) {
      throw new InternalServerErrorException(e);
    }
  }

  async getPublishedExam(examId: number): Promise<Exam> {
    try {
      const exam: Exam = await this.findOne({
        where: { id: examId, isPublished: true },
      });
      delete exam.sections;
      if (!exam) throw new NotFoundException('Exam Not Found');
      return exam;
    } catch (e) {
      throw new InternalServerErrorException(e);
    }
  }

  async getLatestExams(): Promise<Exam[]> {
    try {
      const exams: Exam[] = await this.createQueryBuilder('exam')
        .select('exam.id')
        .addSelect('exam.isPublished')
        .addSelect('exam.imageUrl')
        .addSelect('exam.title')
        .addSelect('exam.authorName')
        .addSelect('exam.ownerId')
        .addSelect('exam.totalRating')
        .addSelect('exam.ratingPeople')
        .addSelect('exam.testTakers')
        .addSelect('exam.description')
        .addSelect('exam.updatedBy')
        .addSelect('exam.timeAllowed')
        .addSelect('exam.subject')
        .where('exam.isPublished = :value', { value: true })
        .orderBy('exam.updatedBy', 'DESC')
        .limit(5)
        .getMany();
      return exams;
    } catch (e) {
      throw new InternalServerErrorException(e);
    }
  }

  async getRelatedExams(examId: number): Promise<Exam[]> {
    try {
      const exam = await this.findOne(examId);
      if (!exam) throw new NotFoundException();
      else {
        const exams: Exam[] = await this.createQueryBuilder('exam')
          .select('exam.id')
          .addSelect('exam.isPublished')
          .addSelect('exam.imageUrl')
          .addSelect('exam.title')
          .addSelect('exam.totalRating')
          .addSelect('exam.ratingPeople')
          .addSelect('exam.testTakers')
          .addSelect('exam.description')
          .addSelect('exam.updatedBy')
          .addSelect('exam.timeAllowed')
          .addSelect('exam.ownerId')
          .addSelect('exam.subject')
          .addSelect('exam.authorName')
          .where('exam.subject = :subject', { subject: exam.subject })
          .andWhere('exam.isPublished = :value', { value: true })
          .orderBy('exam.updatedBy', 'DESC')
          .limit(5)
          .getMany();
        return exams;
      }
    } catch (e) {
      throw new InternalServerErrorException(e);
    }
  }

  async getSubjects(): Promise<any> {
    try {
      return Subjects;
    } catch (e) {
      throw new InternalServerErrorException(e);
    }
  }
  /******Exams Methods for Restricted Users** */
  async getRestrictedExamIndexes(): Promise<Partial<Exam>[]> {
    return await this.createQueryBuilder('exam')
      .select('exam.id')
      .addSelect('exam.title')
      .addSelect('exam.subject')
      .where('exam.restrictedAccessList is NOT NULL')
      .getMany();
  }

  async getRestrictedExams(
    user: User,
    filterExamDto: FilterExamDto,
  ): Promise<Exam[]> {
    const query = this.createQuery(null, user.email, filterExamDto);
    return await query.getMany();
  }

  async getRestrictedExamsCount(user: User): Promise<number> {
    try {
      const total: Exam[] = await this.find({
        where: { restrictedAccessList: Like(`%${user.email}%`) },
      });
      return total.length;
    } catch (e) {
      throw new InternalServerErrorException(e);
    }
  }

  /****Exams Methods for Owner*** */
  async getExams(userId: number): Promise<Exam[]> {
    return await this.createQueryBuilder('exam')
      .select('exam.id')
      .addSelect('exam.isPublished')
      .addSelect('exam.title')
      .addSelect('exam.imageUrl')
      .addSelect('exam.totalRating')
      .addSelect('exam.ratingPeople')
      .addSelect('exam.testTakers')
      .addSelect('exam.description')
      .addSelect('exam.updatedBy')
      .addSelect('exam.timeAllowed')
      .addSelect('exam.subject')
      .addSelect('exam.restrictedAccessList')
      .where('exam.ownerId = :userId', { userId })
      .orderBy('exam.updatedBy', 'DESC')
      .getMany();
  }

  async createExam(createExamDto: CreateExamDto, user: User): Promise<Exam[]> {
    const { title, description, timeAllowed, subject, imageUrl } =
      createExamDto;
    const exam = new Exam();
    if (imageUrl) exam.imageUrl = imageUrl;
    exam.title = title;
    exam.description = description;
    exam.owner = user;
    exam.authorName = `${user.firstName} ${user.lastName}`;
    exam.timeAllowed = timeAllowed;
    exam.subject = subject;
    await exam.save();
    return await this.getExams(user.id);
  }

  async getExam(examId: number, user: User): Promise<Exam> {
    const exam: Exam = await this.createQueryBuilder('exam')
      .leftJoinAndSelect('exam.sections', 'section')
      .where('exam.id = :examId', { examId })
      .andWhere('exam.ownerId = :ownerId', { ownerId: user.id })
      .getOne();
    if (!exam) throw new NotFoundException('Exam Not Found');
    return exam;
  }

  async updateExam(
    updatedExamDto: UpdateExamDto,
    examId: number,
    user: User,
  ): Promise<Exam[]> {
    try {
      const exam: Exam = await this.findOne({
        where: { id: examId, ownerId: user.id },
      });
      if (!exam) throw new NotFoundException('Exam Not Found');
      const { title, description, imageUrl, timeAllowed } = updatedExamDto;
      if (title) exam.title = title;
      if (description) exam.description = description;
      if (timeAllowed) exam.timeAllowed = timeAllowed;
      if (imageUrl) exam.imageUrl = imageUrl;
      else exam.imageUrl = null;
      await exam.save();
      const exams: Exam[] = await this.getExams(user.id);
      return exams.map((e) => {
        if (e.id === exam.id) return exam;
        else return e;
      });
    } catch (e) {
      throw new InternalServerErrorException(e);
    }
  }

  async togglePublishExam(examId: number, user: User): Promise<Exam[]> {
    try {
      const exam: Exam = await this.findOne({
        where: { id: examId, ownerId: user.id },
      });
      if (!exam) throw new NotFoundException('Exam Not Found');
      else {
        exam.isPublished = !exam.isPublished;
        await exam.save();
        return await this.getExams(user.id);
      }
    } catch (e) {
      throw new InternalServerErrorException(e);
    }
  }

  async postRestrictedAccessList(
    restrictedList: string,
    examId: number,
    user: User,
  ): Promise<Exam[]> {
    try {
      const exam: Exam = await this.findOne({
        where: { id: examId, ownerId: user.id },
      });
      if (!exam) throw new NotFoundException('Exam Not Found');
      else {
        exam.restrictedAccessList = restrictedList;
        await exam.save();
        const exams: Exam[] = await this.getExams(user.id);
        return exams.map((e) => {
          if (e.id === exam.id && e.restrictedAccessList !== restrictedList) {
            e.restrictedAccessList = restrictedList;
          }
          return e;
        });
      }
    } catch (e) {
      throw new InternalServerErrorException(e);
    }
  }

  async removeExam(examId: number, userId: number): Promise<Exam[]> {
    try {
      const exam: Exam = await this.findOne({
        where: { id: examId },
      });
      if (!exam) throw new NotFoundException('Exam Not Found');
      // Get neccessary helper functions
      const {
        deleteImage,
        batchDeleteAudio,
        batchDeleteImage,
      } = require('../shared/helpers');

      // 1. Remove all corresponding images of Exam
      if (exam && Boolean(exam.imageUrl)) {
        const filename = exam.imageUrl.substring(
          exam.imageUrl.lastIndexOf('/') + 1,
        );
        if (filename) await deleteImage(filename);
      }

      const sections: Section[] = await getConnection()
        .createQueryBuilder()
        .select('section.id')
        .from(Section, 'section')
        .where('section.examId =:examId', { examId })
        .getMany();

      if (sections.length > 0) {
        const sectionIds = sections.map((section) => section.id);
        // 2. Delete Images and Audios of Corresponding Sections
        const sectionImgArr: string[] = [];
        const sectionAudioArr: string[] = [];
        sections.forEach((section) => {
          if (section.imageUrl) {
            const fileName = section.imageUrl.substring(
              section.imageUrl.lastIndexOf('/') + 1,
            );
            if (fileName) sectionImgArr.push(fileName);
          }
          if (section.audioUrl) {
            const fileName = section.audioUrl.substring(
              section.audioUrl.lastIndexOf('/') + 1,
            );
            if (fileName) sectionAudioArr.push(fileName);
          }
        });
        if (sectionImgArr.length > 0) await batchDeleteImage(sectionImgArr);
        if (sectionAudioArr.length > 0) await batchDeleteAudio(sectionAudioArr);

        const questionGroups: QuestionGroup[] = await getConnection()
          .createQueryBuilder()
          .select('id')
          .from(QuestionGroup, 'questionGroup')
          .where('questionGroup.sectionId IN (:...sectionIds)', {
            sectionIds: [...sectionIds],
          })
          .getMany();

        if (questionGroups.length > 0) {
          const questionGroupIds = questionGroups.map(
            (questionGroup) => questionGroup.id,
          );

          // 3. Delete Images of Corresponding Question Groups
          const questionGrpImgArr: string[] = [];
          questionGroups.forEach((qG) => {
            if (qG.imageUrl) {
              const fileName = qG.imageUrl.substring(
                qG.imageUrl.lastIndexOf('/') + 1,
              );
              if (fileName) questionGrpImgArr.push(fileName);
            }
          });
          if (questionGrpImgArr.length > 0)
            await batchDeleteImage(questionGrpImgArr);

          const questions: Question[] = await getConnection()
            .createQueryBuilder()
            .select('id')
            .from(Question, 'question')
            .where('question.questionGroupId IN (:...questionGroupIds)', {
              questionGroupIds: [...questionGroupIds],
            })
            .getMany();

          if (questions.length > 0) {
            const questionIds = questions.map((question) => question.id);
            // 4. Delete Images of Corresponding Exam Questions
            const questionImgArr: string[] = [];
            questions.forEach((q) => {
              if (q.imageUrl) {
                const fileName = q.imageUrl.substring(
                  q.imageUrl.lastIndexOf('/') + 1,
                );
                if (fileName) questionImgArr.push(fileName);
              }
            });
            if (questionImgArr.length > 0)
              await batchDeleteImage(questionImgArr);

            //5. Delete Answers of Corresponding Questions
            await getConnection()
              .createQueryBuilder()
              .delete()
              .from(Answer)
              .where('questionId IN (:...questionIds)', {
                questionIds: [...questionIds],
              })
              .execute();

            //6. Delete Exam Questions
            await getConnection()
              .createQueryBuilder()
              .delete()
              .from(Question)
              .where('id IN (:...questionIds)', {
                questionIds: [...questionIds],
              })
              .execute();
          }
          //7. Delete Question Group
          await getConnection()
            .createQueryBuilder()
            .delete()
            .from(QuestionGroup)
            .where('id IN (:...questionGroupIds)', {
              questionGroupIds: [...questionGroupIds],
            })
            .execute();
        }
        //8. Delete Section
        await getConnection()
          .createQueryBuilder()
          .delete()
          .from(Section)
          .where('id IN (:...sectionIds)', { sectionIds: [...sectionIds] })
          .execute();
      }

      // 9. Delete Corresponding Enrollment Records
      // 9.1. If this is Enrollment Record for speaking test,
      // the recording audio urls need to be removed
      if (exam.subject === 3) {
        const testEnrollments: TestEnrollment[] = await getConnection()
          .createQueryBuilder()
          .select('id')
          .from(TestEnrollment, 'e')
          .where('e.examId = :examId', { examId })
          .getMany();

        if (testEnrollments.length > 0) {
          for (const e of testEnrollments) {
            const urlArr = [];
            const answers = JSON.parse(e.answerObj);

            for (const a in answers) {
              if (answers.hasOwnProperty(a) && answers[a].userAnswer[0])
                urlArr.push(answers[a].userAnswer[0]);
            }

            const answerAudioArr: string[] = [];
            urlArr.forEach((url) => {
              const filename = url.substring(url.lastIndexOf('/') + 1);
              if (filename) answerAudioArr.push(filename);
            });

            if (answerAudioArr.length > 0)
              await batchDeleteAudio(answerAudioArr);
          }
        }
      }
      // 9.2. Remove Test Enrollment Records
      await getConnection()
        .createQueryBuilder()
        .delete()
        .from(TestEnrollment)
        .where('examId =:examId', { examId })
        .execute();

      // 10. Delete Corresponding Students' questions
      await getConnection()
        .createQueryBuilder()
        .delete()
        .from(StudentQuestion)
        .where('examId =:examId', { examId })
        .execute();

      //11. Delete Exam
      await this.delete(examId);
      return await this.getExams(userId);
    } catch (e) {
      throw new InternalServerErrorException(e);
    }
  }
  /******Helper Methods***** */
  createQuery(
    isPublished: boolean | null,
    userEmail: string | null,
    filterExamDto: FilterExamDto,
  ) {
    const { search, subject, authorId, limit, offset } = filterExamDto;
    const query = this.createQueryBuilder('exam')
      .select('exam.id')
      .addSelect('exam.isPublished')
      .addSelect('exam.imageUrl')
      .addSelect('exam.title')
      .addSelect('exam.ownerId')
      .addSelect('exam.authorName')
      .addSelect('exam.totalRating')
      .addSelect('exam.ratingPeople')
      .addSelect('exam.testTakers')
      .addSelect('exam.description')
      .addSelect('exam.updatedBy')
      .addSelect('exam.timeAllowed')
      .addSelect('exam.subject');

    if (isPublished) query.where('exam.isPublished = :value', { value: true });
    else if (userEmail)
      query.where('exam.restrictedAccessList LIKE :email', {
        email: `%${userEmail}%`,
      });

    if (search)
      query.andWhere(
        'LOWER(exam.title) LIKE :search OR LOWER(exam.description) LIKE :search',
        { search: `%${search.toLowerCase()}%` },
      );
    if (subject === 0 || subject) {
      query.andWhere('exam.subject = :subjectId', { subjectId: subject });
    }
    if (authorId === 0 || authorId) {
      query.andWhere('exam.ownerId = :ownerId', { ownerId: authorId });
    }
    query.orderBy('exam.updatedBy', 'DESC');
    if (offset) query.offset(offset);
    if (limit) query.limit(limit);
    return query;
  }
}
