import axios from 'axios';
import * as config from 'config';
import { Exam, Subjects } from './entities/exam.entity';
import { EntityRepository, getConnection, Repository } from 'typeorm';
import { CreateExamDto, FilterExamDto, UpdateExamDto } from './dto';
import { User } from 'src/auth/entities/user.entity';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Question } from './entities/question.entity';
import { TestEnrollment } from './entities/test-enrollment.entity';
import { Post, Comment } from 'src/post/entities/post.entity';
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
    try {
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
        .addSelect('exam.subject')
        .where('exam.isPublished = :value', { value: true });
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
      const exams = await query.getMany();
      return exams;
    } catch (e) {
      console.log('error --- ', e);
      throw new BadRequestException('Something went wrong.');
    }
  }

  async getPublishedExam(examId: number): Promise<Exam> {
    try {
      const exam = await this.findOne({
        where: { id: examId, isPublished: true },
      });
      delete exam.sections;
      if (!exam) throw new NotFoundException('Exam Not Found');
      return exam;
    } catch (e) {
      throw new BadRequestException('Something went wrong.');
    }
  }

  async getLatestExams(): Promise<Exam[]> {
    try {
      return await this.createQueryBuilder('exam')
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
    } catch (e) {
      throw new BadRequestException('Something went wrong.');
    }
  }

  async getRelatedExams(examId: number): Promise<Exam[]> {
    try {
      const exam = await this.findOne(examId);
      if (!exam) throw new NotFoundException();
      else {
        return await this.createQueryBuilder('exam')
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
      }
    } catch (e) {
      throw new BadRequestException('Something went wrong.');
    }
  }

  async getSubjects(): Promise<any> {
    return Subjects;
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

  /****Exams Methods for Owner*** */
  async getExams(user: User): Promise<Exam[]> {
    const exams = await this.createQueryBuilder('exam')
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
      .where('exam.ownerId = :userId', { userId: user.id })
      .orderBy('exam.updatedBy', 'DESC')
      .getMany();
    return exams;
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
    return await this.getExams(user);
  }

  async getExam(examId: number, user: User): Promise<Exam> {
    const exam = await this.createQueryBuilder('exam')
      .leftJoinAndSelect('exam.sections', 'section')
      .where('exam.id = :examId', { examId })
      .andWhere('exam.ownerId = :ownerId', { ownerId: user.id })
      .getOne();
    if (!exam) throw new NotFoundException('Exam Not Found');
    if (exam.ownerId !== user.id)
      throw new NotFoundException('You are not permitted');
    return exam;
  }

  async updateExam(
    updatedExamDto: UpdateExamDto,
    examId: number,
    user: User,
  ): Promise<Exam[]> {
    try {
      const exam = await this.findOne({
        where: { id: examId, ownerId: user.id },
      });
      if (!exam) throw new NotFoundException('Exam Not Found');
      const { title, description, imageUrl } = updatedExamDto;
      if (title) exam.title = title;
      if (description) exam.description = description;
      
      if (imageUrl) exam.imageUrl = imageUrl;
      else exam.imageUrl = null;

      await exam.save();
      return await this.getExams(user);
    } catch(e){
      throw new NotFoundException('Exam Not Found');
    }
  }

  async togglePublishExam(examId: number, user: User): Promise<Exam[]> {
    try {
      const exam = await this.findOne({
        where: { id: examId, ownerId: user.id },
      });
      if (!exam) throw new NotFoundException('Exam Not Found');
      else {
        exam.isPublished = !exam.isPublished;
        await exam.save();
        return await this.getExams(user);
      }
    } catch (e) {
      throw new NotFoundException('Exam Not Found');
    }
  }

  async postRestrictedAccessList(restrictedList: string, examId: number, user: User) : Promise<Exam[]>{
    try {
      const exam = await this.findOne({
        where: { id: examId, ownerId: user.id },
      });
      if (!exam) throw new NotFoundException('Exam Not Found');
      else {
        exam.restrictedAccessList = restrictedList;
        await exam.save();
        const exams = await this.getExams(user);
        return exams.map((e) => {
          if(e.id === exam.id 
            &&  e.restrictedAccessList !== restrictedList){ 
            e.restrictedAccessList = restrictedList;
          }
          return e;
        })
      }
    } catch (e) {
      throw new NotFoundException('Exam Not Found');
    }
  }

  async removeExam(examId: number, user: User): Promise<Exam[]> {
    try {
      const exam = await this.findOne({
        where: { id: examId, ownerId: user.id },
      });
      if (!exam) throw new NotFoundException('Exam Not Found');
      const sections = await getConnection()
        .createQueryBuilder()
        .select('section.id')
        .from(Section, 'section')
        .where('section.examId =:examId', { examId })
        .getMany();
      //TODO: Remove Images and Audios of Questions, QuestionGroup, and Sections
      if (sections.length > 0) {
        const sectionIds = sections.map((section) => section.id);
        //Delete Images and Audios of Corresponding Sections
        for (let section of sections) {
          if (Boolean(section.imageUrl)) {
            const filename = section.imageUrl.substring(
              section.imageUrl.lastIndexOf('/') + 1,
            );
            const url = `${config.get('deleteImage').url}/${filename}`;
            await axios.delete(url);
          }
          if (Boolean(section.audioUrl)) {
            const filename = section.audioUrl.substring(
              section.audioUrl.lastIndexOf('/') + 1,
            );
            const url = `${config.get('deleteAudio').url}/${filename}`;
            await axios.delete(url);
          }
        }

        const questionGroups = await getConnection()
          .createQueryBuilder()
          .select('id')
          .from(QuestionGroup, 'questionGroup')
          .where('questionGroup.sectionId IN (:...sectionIds)', {
            sectionIds: [...sectionIds],
          })
          .execute();
        if (questionGroups.length > 0) {
          const questionGroupIds = questionGroups.map(
            (questionGroup) => questionGroup.id,
          );
          //Delete Images of Corresponding Question Groups
          for (let questionGroup of questionGroups) {
            if (Boolean(questionGroup.imageUrl)) {
              const filename = questionGroup.imageUrl.substring(
                questionGroup.imageUrl.lastIndexOf('/') + 1,
              );
              const url = `${config.get('deleteImage').url}/${filename}`;
              await axios.delete(url);
            }
          }

          const questions = await getConnection()
            .createQueryBuilder()
            .select('id')
            .from(Question, 'question')
            .where('question.questionGroupId IN (:...questionGroupIds)', {
              questionGroupIds: [...questionGroupIds],
            })
            .execute();
          if (questions.length > 0) {
            const questionIds = questions.map((question) => question.id);
            //Delete Images of Corresponding Questions
            for (let question of questions) {
              if (Boolean(question.imageUrl)) {
                const filename = question.imageUrl.substring(
                  question.imageUrl.lastIndexOf('/') + 1,
                );
                const url = `${config.get('deleteImage').url}/${filename}`;
                await axios.delete(url);
              }
            }
            //Delete Answers of Corresponding Questions
            await getConnection()
              .createQueryBuilder()
              .delete()
              .from(Answer)
              .where('questionId IN (:...questionIds)', {
                questionIds: [...questionIds],
              })
              .execute();
            //Delete Questions
            await getConnection()
              .createQueryBuilder()
              .delete()
              .from(Question)
              .where('id IN (:...questionIds)', { questionIds: [...questionIds] })
              .execute();
          }
          //Delete Question Group
          await getConnection()
            .createQueryBuilder()
            .delete()
            .from(QuestionGroup)
            .where('id IN (:...questionGroupIds)', {
              questionGroupIds: [...questionGroupIds],
            })
            .execute();
        }
        //Delete Section
        await getConnection()
          .createQueryBuilder()
          .delete()
          .from(Section)
          .where('id IN (:...sectionIds)', { sectionIds: [...sectionIds] })
          .execute();
      }
      // Delete Exam
      await getConnection()
        .createQueryBuilder()
        .delete()
        .from(TestEnrollment)
        .where('examId =:examId', { examId })
        .execute();

      const posts = await getConnection()
        .createQueryBuilder()
        .select('id')
        .from(Post, 'post')
        .where('post.examId =:examId', { examId })
        .getMany();

      if (posts.length > 0) {
        const postIds = posts.map((post) => post.id);
        await getConnection()
          .createQueryBuilder()
          .delete()
          .from(Comment)
          .where('postId IN (:...postIds)', { postIds: [...postIds] })
          .execute();

        await getConnection()
          .createQueryBuilder()
          .delete()
          .from(Post)
          .where('examId =:examId', { examId })
          .execute();
      }

      await this.delete(examId);
      return await this.getExams(user);
    } catch (e){
      throw new NotFoundException('Exam Not Found');
    }
  }
}
