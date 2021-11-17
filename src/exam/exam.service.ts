import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';
import {
  CreateQuestionDto,
  FilterExamDto,
  UpdateExamDto,
  UpdateQuestionDto,
} from './dto';
import { InjectRepository } from '@nestjs/typeorm';
import { ExamRepository } from './exam.repositary';
import { User } from 'src/auth/entities/user.entity';
import { QuestionRepository } from './question.repository';
import { AnswerRepository } from './answer.repository';
import { Exam } from './entities/exam.entity';
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
import axios from 'axios';
import * as config from 'config';
import { CreateSectionDto } from './dto/create-section.dto';
import { CreateQuestionGroupDto } from './dto/create-questionGroup.dto';
import { UpdateWritingSectionDto } from './dto/update-writing-section.dto';

@Injectable()
export class ExamService {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) 
    private readonly logger: Logger,

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
  /****Exam Services For Public Users & Students*****/
  /************************************* */
  async getExamIndexes(): Promise<Partial<Exam>[]> {
    return await this.examRepository.find({
      select: ['id', 'ownerId'],
    });
  }
  async getPublishedExamIndexes(): Promise<Partial<Exam>[]> {
    return await this.examRepository.getPublishedExamIndexes();
  }
  async getRestrictedExamIndexes(): Promise<Partial<Exam>[]> {
    return await this.examRepository.getRestrictedExamIndexes();
  }
  async getPublishedExams(filterExamDto: FilterExamDto): Promise<Exam[]> {
    return await this.examRepository.getPublishedExams(filterExamDto);
  }
  async getPublishedExamsCount(): Promise<number> {
    return await this.examRepository.getPublishedExamsCount();
  }
  async getRestrictedExams(
    user: User,
    filterExamDto: FilterExamDto,
  ): Promise<Exam[]> {
    return await this.examRepository.getRestrictedExams(user, filterExamDto);
  }
  async getRestrictedExamsCount(user: User): Promise<number> {
    return await this.examRepository.getRestrictedExamsCount(user);
  }
  async getPublishedExam(examId: number): Promise<Exam> {
    return await this.examRepository.getPublishedExam(examId);
  }

  async getRestrictedExam(user: User, examId: number): Promise<Exam> {
    try {
      const exam = await this.examRepository.findOne({
        where: { id: examId },
      });
      if (!exam) throw new NotFoundException('Exam Not Found');
      // Exam owner can access the test
      if (exam.ownerId === user.id) {
        delete exam.sections;
        return exam;
      }
      // Student whose email listed in the restricted access list can access the test
      if (exam.restrictedAccessList) {
        const list = JSON.parse(exam.restrictedAccessList);
        const isIncluded = list.filter((item) => item.content === user.email);
        if (isIncluded[0]) {
          delete exam.sections;
          return exam;
        }
      }
      throw new UnauthorizedException('You are not permitted to take the test');
    } catch (e) {
      return e;
    }
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

  async getRestrictedExamForTestTaker(
    user: User,
    examId: number,
  ): Promise<{ exam: Exam; sections: Section[] }> {
    try {
      const exam = await this.examRepository.findOne({
        where: { id: examId },
      });
      const sections = await this.sectionRepository.find({ where: { examId } });
      if (!exam) throw new NotFoundException('Exam Not Found');

      // Exam owner can access the test
      if (exam.ownerId === user.id) {
        return { exam, sections };
      }
      // Student whose email listed in the restricted access list can access the test
      if (exam.restrictedAccessList) {
        const list = JSON.parse(exam.restrictedAccessList);
        const isIncluded = list.filter((item) => item.content === user.email);
        if (isIncluded[0]) {
          return { exam, sections };
        }
      }
      throw new UnauthorizedException('You are not permitted to take the test');
    } catch (e) {
      return e;
    }
  }

  async updateExamRating(rating: number, examId: number): Promise<void> {
    try {
      const exam : Exam = await this.examRepository.findOne(examId);
      if (!exam) throw new NotFoundException('Exam Not Found');
      // Update Exam Rating
      exam.totalRating += rating;
      exam.ratingPeople++;
      await exam.save();
    } catch (e) {
      throw new InternalServerErrorException(e);
    }
  }

  /************************************* */
  /****Exam Services For Owner*****/
  /************************************* */

  async getExams(user: User): Promise<Exam[]> {
    return await this.examRepository.getExams(user.id);
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
    const exam : Exam = await this.getExam(examId, user);
    //1. Remove corresponding images
    if (exam && Boolean(exam.imageUrl) && exam.imageUrl !== imageUrl) {
      const filename = exam.imageUrl.substring(
        exam.imageUrl.lastIndexOf('/') + 1,
      );
      const url = `${config.get('deleteImage').url}/${filename}`;
      await axios.delete(url);
    }
    //2. Update Exam
    return await this.examRepository.updateExam(updatedExamDto, examId, user);
  }

  async togglePublishExam(examId: number, user: User): Promise<Exam[]> {
    return await this.examRepository.togglePublishExam(examId, user);
  }

  async postRestrictedAccessList(
    restrictedList: string,
    examId: number,
    user: User,
  ): Promise<Exam[]> {
    return await this.examRepository.postRestrictedAccessList(
      restrictedList,
      examId,
      user,
    );
  }

  async removeExam(examId: number, user: User): Promise<Exam[]> {
    try {
      return await this.examRepository.removeExam(examId, user.id);
    } catch (e) {
      throw new InternalServerErrorException(e);
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
    try {
      /***Check the User's Permission***/
      const exam = await this.examRepository.findOne({
        where: { id: examId, ownerId: user.id },
      });
      if (!exam) throw new NotFoundException('Exam Not Found');
      /***********************************/ else {
        return await this.sectionRepository.createSection(
          createSectionDto,
          exam,
          user,
        );
      }
    } catch (e) {
      throw new InternalServerErrorException(e);
    }
  }

  async createWritingSection(
    createWritingSectionDto: any,
    exam: Exam,
    user: User,
  ): Promise<Section> {
    try {
      /********************************/
      // 1. Create Section
      const sectionDto: CreateSectionDto = {
        title: createWritingSectionDto.title,
        directions: createWritingSectionDto.directions,
        imageUrl: createWritingSectionDto.imageUrl || null,
        audioUrl: null,
        htmlContent: null,
        transcription: null,
      };
      const section = await this.sectionRepository.createSection(
        sectionDto,
        exam,
        user,
      );
      // 2. Create Question Group
      const questionDto: CreateQuestionDto = {
        imageUrl: null,
        score: createWritingSectionDto.score,
        order: null,
        minWords: createWritingSectionDto.minWords,
        question: createWritingSectionDto.question,
        htmlExplaination: createWritingSectionDto.htmlExplaination,
        answers: null,
      };
      const questionGroupDto: CreateQuestionGroupDto = {
        type: 7,
        title: '',
        imageUrl: null,
        htmlContent: null,
        matchingOptions: null,
        questions: [questionDto],
      };
      const questionGroups = await this.createQuestionGroup(
        questionGroupDto,
        exam.id,
        section.id,
        user,
      );
      section.questionGroups = questionGroups;
      return section;
    } catch (e) {
      throw new NotFoundException('Exam Not Found');
    }
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
    try {
      //1. Remove Existing Audio and Image Files from File System
      const { audioUrl, imageUrl } = updateSectionDto;
      const section = await this.sectionRepository.getSection(
        examId,
        sectionId,
        user,
      );
      if(!section) throw new NotFoundException("Section Not Found");
      if (
        section &&
        Boolean(section.imageUrl) &&
        section.imageUrl !== imageUrl
      ) {
        const filename = section.imageUrl.substring(
          section.imageUrl.lastIndexOf('/') + 1,
        );
        const url = `${config.get('deleteImage').url}/${filename}`;
        await axios.delete(url);
      }
      if (
        section &&
        Boolean(section.audioUrl) &&
        section.audioUrl !== audioUrl
      ) {
        const filename = section.audioUrl.substring(
          section.audioUrl.lastIndexOf('/') + 1,
        );
        const url = `${config.get('deleteAudio').url}/${filename}`;
        await axios.delete(url);
      }
      //2. Update the section
      return await this.sectionRepository.updateSection(
        updateSectionDto,
        examId,
        sectionId,
        user,
      );
    } catch (e) {
      throw new InternalServerErrorException(e);
    }
  }

  async updateWritingSection(
    updateWritingSectionDto: UpdateWritingSectionDto,
    exam: Exam,
    sectionId: number,
    user: User,
  ): Promise<Section> {
    try {
      //1. Remove Existing Audio and Image Files of Writing Section
      const { imageUrl } = updateWritingSectionDto;
      const section : Section = await this.sectionRepository.getSection(
        exam.id,
        sectionId,
        user,
      );
      if(!section) throw new NotFoundException("Section Not Found");
      if (
        section &&
        Boolean(section.imageUrl) &&
        section.imageUrl !== imageUrl
      ) {
        const filename = section.imageUrl.substring(
          section.imageUrl.lastIndexOf('/') + 1,
        );
        const url = `${config.get('deleteImage').url}/${filename}`;
        await axios.delete(url);
      }
      //2. Create questionDto, sectionDto, and questionGroupDto
      const sectionDto: UpdateSectionDto = {
        title: updateWritingSectionDto.title,
        directions: updateWritingSectionDto.directions,
        imageUrl: updateWritingSectionDto.imageUrl || null,
      };
      const questionDto: CreateQuestionDto = {
        imageUrl: null,
        score: updateWritingSectionDto.score,
        order: null,
        minWords: updateWritingSectionDto.minWords,
        question: updateWritingSectionDto.question,
        htmlExplaination: updateWritingSectionDto.htmlExplaination,
        answers: null,
      };
      const questionGroupDto: UpdateQuestionGroupDto = {
        title: '',
        imageUrl: null,
        htmlContent: null,
        questions: [questionDto],
      };
      // 3. Update Section
      const updatedSection : Section = await this.sectionRepository.updateSection(
        sectionDto,
        exam.id,
        sectionId,
        user,
      );
      // 4. Update Question Group
      const updatedQuestionGroup : QuestionGroup[] = await this.updateQuestionGroup(
        questionGroupDto,
        section.id,
        section.questionGroups[0].id,
        user,
      );
      updatedSection.questionGroups = updatedQuestionGroup;
      return updatedSection;
    } catch (e) {
      throw new InternalServerErrorException(e);
    }
  }

  async removeSection(
    examId: number,
    sectionId: number,
    user: User,
  ): Promise<Section[]> {
    try {
      const section : Section = await this.sectionRepository.getSection(
        examId,
        sectionId,
        user,
      );
      if(!section) throw new NotFoundException("Section Not Found");
      //1. Remove Audio and Image Files of Section
      if (section && Boolean(section.imageUrl)) {
        const filename = section.imageUrl.substring(
          section.imageUrl.lastIndexOf('/') + 1,
        );
        const url = `${config.get('deleteImage').url}/${filename}`;
        await axios.delete(url);
      }
      if (section && Boolean(section.audioUrl)) {
        const filename = section.audioUrl.substring(
          section.audioUrl.lastIndexOf('/') + 1,
        );
        const url = `${config.get('deleteAudio').url}/${filename}`;
        await axios.delete(url);
      }
      //2. Remove the section
      await this.sectionRepository.removeSection(examId, sectionId, user);
      return await this.getSections(examId, user);
    } catch (e) {
      throw new InternalServerErrorException(e);
    }
  }

  /************************************* */
  /***Question Group Services For Owner**/
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
    createQuestionGroupDto: CreateQuestionGroupDto,
    examId: number,
    sectionId: number,
    user: User,
  ): Promise<QuestionGroup[]> {
    try {
      const section = await this.getSection(examId, sectionId, user);
      // 1. Create question group
      const questionGroup =
        await this.questionGroupRepository.createQuestionGroup(
          createQuestionGroupDto,
          section,
          user,
        );
      const { questions } = createQuestionGroupDto;
      // 2. Create questions and answers
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
    } catch (e) {
      throw new InternalServerErrorException(e);
    }
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
    try {
      const { questions, imageUrl } = updateQuestionGroupDto;
      const oldQuestionGroup : QuestionGroup = await this.getQuestionGroup(
        questionGroupId,
        user,
      );
      if(!oldQuestionGroup) throw new NotFoundException("Question Group Not Found");
      // 1. Delete image of the question group
      if (
        Boolean(oldQuestionGroup.imageUrl) &&
        oldQuestionGroup.imageUrl !== imageUrl
      ) {
        const filename = oldQuestionGroup.imageUrl.substring(
          oldQuestionGroup.imageUrl.lastIndexOf('/') + 1,
        );
        const url = `${config.get('deleteImage').url}/${filename}`;
        await axios.delete(url);
      }
      // 2. Update and get updated question group
      const questionGroup : QuestionGroup =
        await this.questionGroupRepository.updateQuestionGroup(
          updateQuestionGroupDto,
          questionGroupId,
          user,
        );
      if(questionGroup.questions){    
        const questionIds = questionGroup.questions.map(
          (question) => question.id,
        );

        //3. Delete image file of corresponding questions
        for (const question of questionGroup.questions) {
          if (Boolean(question.imageUrl)) {
            const filename = question.imageUrl.substring(
              question.imageUrl.lastIndexOf('/') + 1,
            );
            const url = `${config.get('deleteImage').url}/${filename}`;
            await axios.delete(url);
          }
        }
        if (questionIds.length > 0) {
          //4. Delete corresponding answers
          await getConnection()
            .createQueryBuilder()
            .delete()
            .from(Answer)
            .where('questionId IN (:...questionIds)', {
              questionIds: [...questionIds],
            })
            .execute();
          //5. Delete corresponding questions
          await getConnection()
            .createQueryBuilder()
            .delete()
            .from(Question)
            .where('id IN (:...questionIds)', { questionIds: [...questionIds] })
            .execute();
        }
      }

      //6. Create questions and answers
      const newQuestions : Question[] = [];
      if(questions){
        for (const q of questions) {
          const question : Question = await this.createQuestion(q, questionGroup.id, user);
          newQuestions.push(question);
        }
      }
      let questionGroups : QuestionGroup[] = await this.getQuestionGroups(sectionId, user);
      //7. Return new question group array
      questionGroups = questionGroups.map((q) => {
        if (q.id === questionGroup.id) q.questions = newQuestions;
        return q;
      });
      return questionGroups;
    } catch (e) {
      throw new InternalServerErrorException(e);
    }
  }

  async removeQuestionGroup(
    sectionId: number,
    questionGroupId: number,
    user: User,
  ): Promise<QuestionGroup[]> {
    try {
      const questionGroup : QuestionGroup = await this.questionGroupRepository.getQuestionGroup(
        questionGroupId,
        user,
      );
      // 1. Delete image of the question group
      if (Boolean(questionGroup.imageUrl)) {
        const filename = questionGroup.imageUrl.substring(
          questionGroup.imageUrl.lastIndexOf('/') + 1,
        );
        const url = `${config.get('deleteImage').url}/${filename}`;
        await axios.delete(url);
      }

      //2. Delete image file of corresponding questions
      for (const question of questionGroup.questions) {
        if (Boolean(question.imageUrl)) {
          const filename = question.imageUrl.substring(
            question.imageUrl.lastIndexOf('/') + 1,
          );
          const url = `${config.get('deleteImage').url}/${filename}`;
          await axios.delete(url);
        }
      }

      await this.questionGroupRepository.removeQuestionGroup(
        questionGroupId,
        user,
      );
      return await this.getQuestionGroups(sectionId, user);
    } catch (e) {
      throw new InternalServerErrorException(e);
    }
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
    // 1. Get question group
    const questionGroup : QuestionGroup = await this.getQuestionGroup(questionGroupId, user);
    // 2. Create question
    const question : Question = await this.questionRepository.createQuestion(
      createQuestionDto,
      questionGroup,
      user,
    );
    // 3. Create answers
    const { answers } = createQuestionDto;
    const answersArr = [];
    if(answers){
      for (const a of answers) {
      const answer : Answer = await this.createAnswer(a, question.id, user);
      answersArr.push(answer);
      }
    }
    question.answers = answersArr;
    return question;
  }

  async getQuestion(questionId: number, user: User): Promise<Question> {
    const q : Question = await this.questionRepository.getQuestion(questionId, user);
    if (!q) throw new NotFoundException('Question Not Found');
    return q;
  }

  async updateQuestion(
    updateQuestionDto: UpdateQuestionDto,
    questionGroupId: number,
    questionId: number,
    user: User,
  ): Promise<Question[]> {
    await this.questionRepository.updateQuestion(
      updateQuestionDto,
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
    //1. Check the user's permission
    const q : Question = await this.getQuestion(questionId, user);
    if (!q) throw new NotFoundException('Question Not Found!');
    //2. Remove corresponding images of the question
    //3. Remove question
    await this.questionRepository.removeQuestion(questionId);
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
    // Check the user's permission
    const question : Question = await this.questionRepository.getQuestion(
      questionId,
      user,
    );
    if (!question) throw new NotFoundException('Question Not Found');
    // Create question
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
    //1. Check the user's permission
    const answer : Answer = await this.answerRepository.findOne({
      where: { id: answerId, ownerId: user.id },
    });

    if (!answer) throw new NotFoundException('Answer Not Found');
    //2. Remove Answer
    await this.answerRepository.removeAnswer(answerId);
    return await this.getAnswers(questionId, user);
  }

  /************************************* */
  /***Exam Services For Middleware**/
  /************************************* */

  async getExamForMiddleware(examId: string): Promise<Exam> {
    const exam: Exam = await this.examRepository.findOne(examId);
    return exam;
  }

  /************************************* */
  /***Exam Services For Admin**/
  /************************************* */
  async getExamsByEducator(educatorId: number): Promise<Exam[]> {
    return await this.examRepository.find({
      select: [
        'id',
        'title',
        'subject',
        'isPublished',
        'restrictedAccessList',
        'updatedBy',
      ],
      where: { ownerId: educatorId },
    });
  }

  async getExamForAdmin(examId: number): Promise<Exam> {
    const exam: Exam = await this.examRepository.findOne(examId);
    const sections: Section[] = await this.sectionRepository.find({
      where: { examId: examId },
    });
    exam.sections = sections;
    return exam;
  }

  async deleteExamForAdmin(examId: number): Promise<Exam[]> {
    const exam : Exam = await this.examRepository.findOne(examId);
    if (!exam) throw new NotFoundException('Exam Not Found');
    return await this.examRepository.removeExam(examId, exam.ownerId);
  }
}
