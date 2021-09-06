import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { FilterExamDto, UpdateExamDto, UpdateQuestionDto } from './dto';
import { InjectRepository } from '@nestjs/typeorm';
import { ExamRepository } from './exam.repositary';
import { User } from 'src/auth/entities/user.entity';
import { QuestionRepository } from './question.repository';
import { AnswerRepository } from './answer.repository';
import { Exam } from './entities/exam.entity';
import { join } from 'path';
import { Question } from './entities/question.entity';
import { Section } from './entities/section.entity';
import { SectionRepository } from './section.respository';
import { UpdateSectionDto } from './dto/update-section.dto';
import { QuestionGroup } from './entities/questionGroup.entity';
import { QuestionGroupRepository } from './questionGroup.repository';
import { UpdateQuestionGroupDto } from './dto/update-questionGroup.dto';
import { Answer } from './entities/answer.entity';
import { UpdateAnswerDto } from './dto/update-answer.dto';
import { getConnection } from 'typeorm';

@Injectable()
export class ExamService {
  constructor(
    @InjectRepository(ExamRepository)
    private examRepository: ExamRepository,

    @InjectRepository(SectionRepository)
    private sectionRepository: SectionRepository,

    @InjectRepository(QuestionGroupRepository)
    private questionGroupRepository: QuestionGroupRepository,

    @InjectRepository(QuestionRepository)
    private questionRepository: QuestionRepository,

    @InjectRepository(AnswerRepository)
    private answerRepository: AnswerRepository,
  ) {}

  /************************************* */
  /****Exam Services For Public Users*****/
  /************************************* */

  async getPublishedExams(filterExamDto: FilterExamDto): Promise<Exam[]> {
    return await this.examRepository.getPublishedExams(filterExamDto);
  }
  async getPublishedExam(examId: number): Promise<Exam> {
    return await this.examRepository.getPublishedExam(examId);
  }
  async getLatestExams(): Promise<Exam[]> {
    return await this.examRepository.getLatestExams();
  }
  async getRelatedExams(examId: number): Promise<Exam[]> {
    return await this.examRepository.getRelatedExams(examId);
  }
  async getSubjects(): Promise<any> {
    return await this.examRepository.getSubjects();
  }
  async getQuestionTypes(): Promise<string[]> {
    return await this.questionGroupRepository.getQuestionTypes();
  }
  async getExamForTestTaker(
    examId: number,
  ): Promise<{ exam: Exam; sections: Section[] }> {
    try {
      const exam = await this.examRepository.findOne({
        where: { id: examId, isPublished: true },
      });
      if (!exam) throw new NotFoundException('Exam Not Found');
      const sections = await this.sectionRepository.find({ where: { examId } });
      return { exam, sections };
    } catch (e) {
      throw new NotFoundException('Exam Not Found');
    }
  }

  async updateExamRating(rating: number, examId: number): Promise<void> {
    try {
      const exam = await this.examRepository.findOne({
        where: { id: examId, isPublished: true },
      });
      if (!exam) throw new NotFoundException('Exam Not Found');
      // Update Exam Rating
      exam.totalRating += rating;
      exam.ratingPeople++;
      await exam.save();
    } catch (e) {
      throw new NotFoundException('Exam Not Found');
    }
  }

  /************************************* */
  /****Exam Services For Owner*****/
  /************************************* */

  async getExams(user: User): Promise<Exam[]> {
    return await this.examRepository.getExams(user);
  }

  async createExam(createExamDto: any, user: User): Promise<Exam[]> {
    return await this.examRepository.createExam(createExamDto, user);
  }

  async getExam(examId: number, user: User): Promise<Exam> {
    return await this.examRepository.getExam(examId, user);
  }

  async updateExam(
    updatedExamDto: UpdateExamDto,
    examId: number,
    user: User,
  ): Promise<Exam[]> {
    const { imageUrl } = updatedExamDto;
    const exam = await this.getExam(examId, user);
    //1. Remove corresponding images
    if (exam && imageUrl && Boolean(exam.imageUrl)) {
      this.deleteFile(exam.imageUrl);
    }
    //2. Update Exam
    return await this.examRepository.updateExam(updatedExamDto, examId, user);
  }

  async togglePublishExam(examId: number, user: User): Promise<Exam[]> {
    return await this.examRepository.togglePublishExam(examId, user);
  }

  async removeExam(examId: number, user: User): Promise<Exam[]> {
    try {
      const exam = await this.getExam(examId, user);
      //1. Remove corresponding images
      if (exam && Boolean(exam.imageUrl)) {
        this.deleteFile(exam.imageUrl);
      }
      //2. Remove  all corresponding image and audio files in sections
      const sections = await this.getSections(examId, user);
      if (sections.length > 0) {
        sections.map(async (s) => {
          await this.removeSection(examId, s.id, user);
        });
      }
      //3. Remove the exam
      return await this.examRepository.removeExam(examId, user);
    } catch (e) {
      console.log(e);
      throw new BadRequestException('Something went wrong! Try again');
    }
  }

  /************************************* */
  /***Section Services For Owner**/
  /************************************* */

  async getSections(examId: number, user: User): Promise<Section[]> {
    return await this.sectionRepository.getSections(examId, user);
  }

  async createSection(
    createSectionDto: any,
    examId: number,
    user: User,
  ): Promise<Section> {
    const exam = await this.getExam(examId, user);
    return await this.sectionRepository.createSection(
      createSectionDto,
      exam,
      user,
    );
  }

  async getSection(
    examId: number,
    sectionId: number,
    user: User,
  ): Promise<Section> {
    return await this.sectionRepository.getSection(examId, sectionId, user);
  }

  async updateSection(
    updateSectionDto: UpdateSectionDto,
    examId: number,
    sectionId: number,
    user: User,
  ): Promise<Section> {
    //1. Remove Existing Audio and Image Files from File System
    const { audioUrl, imageUrl } = updateSectionDto;
    const section = await this.sectionRepository.getSection(
      examId,
      sectionId,
      user,
    );
    if (section && imageUrl && Boolean(section.imageUrl)) {
      this.deleteFile(section.imageUrl);
    }
    if (section && audioUrl && Boolean(section.audioUrl)) {
      this.deleteFile(section.audioUrl);
    }
    //2. Update the section
    return await this.sectionRepository.updateSection(
      updateSectionDto,
      examId,
      sectionId,
      user,
    );
  }

  async removeSection(
    examId: number,
    sectionId: number,
    user: User,
  ): Promise<Section[]> {
    //1. Remove Audio and Image Files from File System
    const section = await this.sectionRepository.getSection(
      examId,
      sectionId,
      user,
    );
    if (section && Boolean(section.imageUrl)) {
      this.deleteFile(section.imageUrl);
    }
    if (section && Boolean(section.audioUrl)) {
      this.deleteFile(section.audioUrl);
    }
    //2. Remove the section
    await this.sectionRepository.removeSection(examId, sectionId, user);
    return await this.getSections(examId, user);
  }

  /************************************* */
  /***Question Group Services For  Owner**/
  /************************************* */

  async getQuestionGroups(
    sectionId: number,
    user: User,
  ): Promise<QuestionGroup[]> {
    return await this.questionGroupRepository.getQuestionGroups(
      sectionId,
      user,
    );
  }

  async createQuestionGroup(
    createQuestionGroupDto: any,
    examId: number,
    sectionId: number,
    user: User,
  ): Promise<QuestionGroup[]> {
    const section = await this.getSection(examId, sectionId, user);

    const questionGroup =
      await this.questionGroupRepository.createQuestionGroup(
        createQuestionGroupDto,
        section,
        user,
      );
    const { questions } = createQuestionGroupDto;
    //Create questions and answers
    const newQuestions = [];
    for (const q of questions) {
      let question = await this.createQuestion(q, questionGroup.id, user);
      newQuestions.push(question);
    }

    let questionGroups = await this.getQuestionGroups(sectionId, user);
    questionGroups = questionGroups.map((q) => {
      if (q.id === questionGroup.id) q.questions = newQuestions;
      return q;
    });
    return questionGroups;
  }

  async getQuestionGroup(
    questionGroupId: number,
    user: User,
  ): Promise<QuestionGroup> {
    return await this.questionGroupRepository.getQuestionGroup(
      questionGroupId,
      user,
    );
  }

  async updateQuestionGroup(
    updateQuestionGroupDto: UpdateQuestionGroupDto,
    sectionId: number,
    questionGroupId: number,
    user: User,
  ): Promise<QuestionGroup[]> {
    //Update questionGroup
    const { questions } = updateQuestionGroupDto;
    const questionGroup =
      await this.questionGroupRepository.updateQuestionGroup(
        updateQuestionGroupDto,
        questionGroupId,
        user,
      );

    const questionIds = questionGroup.questions.map((question) => question.id);
    if (questionIds.length > 0) {
      //console.log(questionIds);
      //Delete corresponding questions and answers
      await getConnection()
        .createQueryBuilder()
        .delete()
        .from(Answer)
        .where('questionId IN (:...questionIds)', {
          questionIds: [...questionIds],
        })
        .execute();

      await getConnection()
        .createQueryBuilder()
        .delete()
        .from(Question)
        .where('id IN (:...questionIds)', { questionIds: [...questionIds] })
        .execute();
    }
    //Create questions and answers
    const newQuestions = [];
    for (const q of questions) {
      const question = await this.createQuestion(q, questionGroup.id, user);
      newQuestions.push(question);
    }

    let questionGroups = await this.getQuestionGroups(sectionId, user);
    questionGroups = questionGroups.map((q) => {
      if (q.id === questionGroup.id) q.questions = newQuestions;
      return q;
    });
    return questionGroups;
  }

  async removeQuestionGroup(
    sectionId: number,
    questionGroupId: number,
    user: User,
  ): Promise<QuestionGroup[]> {
    await this.questionGroupRepository.removeQuestionGroup(
      questionGroupId,
      user,
    );
    return await this.getQuestionGroups(sectionId, user);
  }

  /************************************* */
  /***Question Services For  Owner**/
  /************************************* */

  async getQuestions(questionGroupId: number, user: User): Promise<Question[]> {
    return await this.questionRepository.getQuestions(questionGroupId, user);
  }

  async createQuestion(
    createQuestionDto: any,
    questionGroupId: number,
    user: User,
  ): Promise<Question> {
    const questionGroup = await this.getQuestionGroup(questionGroupId, user);
    const question = await this.questionRepository.createQuestion(
      createQuestionDto,
      questionGroup,
      user,
    );
    const { answers } = createQuestionDto;
    const answersArr = [];
    for (const a of answers) {
      const answer = await this.createAnswer(a, question.id, user);
      answersArr.push(answer);
    }
    question.answers = answersArr;
    return question;
  }

  async getQuestion(questionId: number, user: User): Promise<Question> {
    return await this.questionRepository.getQuestion(questionId, user);
  }

  async updateQuestion(
    updateQuestionDto: UpdateQuestionDto,
    questionGroupId: number,
    questionId: number,
    user: User,
  ): Promise<Question[]> {
    await this.questionRepository.updateQuestion(
      updateQuestionDto,
      questionGroupId,
      questionId,
      user,
    );
    return await this.getQuestions(questionGroupId, user);
  }

  async removeQuestion(
    questionGroupId: number,
    questionId: number,
    user: User,
  ): Promise<Question[]> {
    await this.questionRepository.removeQuestion(questionId, user);
    return await this.getQuestions(questionGroupId, user);
  }

  /************************************* */
  /***Answer Services For  Owner**/
  /************************************* */

  async getAnswers(questionId: number, user: User): Promise<Answer[]> {
    return await this.answerRepository.getAnswers(questionId, user);
  }

  async createAnswer(
    createAnswerDto: any,
    questionId: number,
    user: User,
  ): Promise<Answer> {
    const question = await this.getQuestion(questionId, user);
    return await this.answerRepository.createAnswer(
      createAnswerDto,
      question,
      user,
    );
  }

  async getAnswer(answerId: number, user: User): Promise<Answer> {
    return await this.answerRepository.getAnswer(answerId, user);
  }

  async updateAnswer(
    updateAnswerDto: UpdateAnswerDto,
    questionId: number,
    answerId: number,
    user: User,
  ): Promise<Answer[]> {
    await this.answerRepository.updateAnswer(updateAnswerDto, answerId, user);
    return await this.getAnswers(questionId, user);
  }

  async removeAnswer(
    questionId: number,
    answerId: number,
    user: User,
  ): Promise<Answer[]> {
    await this.answerRepository.removeAnswer(answerId, user);
    return await this.getAnswers(questionId, user);
  }

  /****************Helper Methods******************* */
  deleteFile(url: string) {
    const fs = require('fs');
    const fileName = url.split('/');
    try {
      fs.unlinkSync(
        join(
          process.cwd(),
          `public/examsFiles/${fileName[fileName.length - 1]}`,
        ),
      );
      console.log('File was deleted');
    } catch (e) {
      console.log('File Deletion Error: Something went wrong');
    }
  }
}
