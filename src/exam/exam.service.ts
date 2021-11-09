import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateQuestionDto, FilterExamDto, UpdateExamDto, UpdateQuestionDto } from './dto';
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
  async getRestrictedExams(user: User, filterExamDto: FilterExamDto): Promise<Exam[]> {
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
      if(exam.ownerId === user.id){ 
          delete exam.sections;
          return exam;
      }
      // Student whose email listed in the restricted access list can access the test
      if(exam.restrictedAccessList){ 
        const list = JSON.parse(exam.restrictedAccessList);
        const isIncluded = list.filter(item => item.content === user.email);
        if(isIncluded[0]) {
          delete exam.sections;
          return exam;
        }
      }
      throw new UnauthorizedException("You are not permitted to take the test");
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

  async getRestrictedExamForTestTaker (
    user: User,
    examId: number
  ): Promise<{ exam: Exam; sections: Section[] }> {
    try {
      const exam = await this.examRepository.findOne({
        where: { id: examId },
      });
      const sections = await this.sectionRepository.find({ where: { examId } });
      if (!exam) throw new NotFoundException('Exam Not Found');
      // Exam owner can access the test
      if(exam.ownerId === user.id){ 
        return { exam, sections };
      }
      // Student whose email listed in the restricted access list can access the test
      if(exam.restrictedAccessList){ 
        const list = JSON.parse(exam.restrictedAccessList);
        const isIncluded = list.filter(item => item.content === user.email);
        if(isIncluded[0]) {
          return { exam, sections };
        }
      }
      throw new UnauthorizedException("You are not permitted to take the test");
    } catch (e) {
      return e;
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

  async postRestrictedAccessList(restrictedList: string, examId: number, user: User): Promise<Exam[]>{
    return await this.examRepository.postRestrictedAccessList(restrictedList, examId, user);
  }

  async removeExam(examId: number, user: User): Promise<Exam[]> {
    try {
      const exam = await this.getExam(examId, user);
      //1. Remove corresponding images
      if (exam && Boolean(exam.imageUrl)) {
        const filename = exam.imageUrl.substring(
          exam.imageUrl.lastIndexOf('/') + 1,
        );
        const url = `${config.get('deleteImage').url}/${filename}`;
        await axios.delete(url);
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
    try {
      /***Check the User's Permission***/
      const exam = await this.examRepository.findOne({
        where: { id: examId, ownerId: user.id },
      });
      if (!exam) throw new NotFoundException('Exam Not Found');
      /***********************************/ 
      else {
        return await this.sectionRepository.createSection(
          createSectionDto,
          exam,
          user,
        );
      }
    } catch (e) {
      throw new NotFoundException('Exam Not Found');
    }
  }

  async createWritingSection(
    createWritingSectionDto: any,
    examId: number,
    user: User): Promise<Section>{
    try{
      /***Check the User's Permission***/
      const exam = await this.examRepository.findOne({
        where: { id: examId, ownerId: user.id },
      });
      if (!exam) throw new NotFoundException('Exam Not Found');
      /********************************/ 
      const sectionDto : CreateSectionDto = {
        title: createWritingSectionDto.title,
        directions: createWritingSectionDto.directions,
        imageUrl: createWritingSectionDto.imageUrl || null,
        audioUrl: null,
        htmlContent: null,
        transcription: null,
      }
      const section = await this.sectionRepository.createSection(
        sectionDto,
        exam,
        user,
      );
      const questionDto : CreateQuestionDto = {
        imageUrl: null,
        score: createWritingSectionDto.score,
        order: null,
        minWords: createWritingSectionDto.minWords,
        question: createWritingSectionDto.question,
        htmlExplaination: createWritingSectionDto.htmlExplaination,
        answers: null
      }
      const questionGroupDto : CreateQuestionGroupDto = {
        type: 7,
        title: "",
        imageUrl: null,
        htmlContent: null,
        matchingOptions: null,
        questions: [questionDto]
      }
      const questionGroups = await this.createQuestionGroup(
        questionGroupDto,
        exam.id,
        section.id,
        user,
      )
      section.questionGroups = questionGroups;
      return section;
    } catch(e){
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
    try{
      /***Check the User's Permission***/
      const exam = await this.examRepository.findOne({
        where: { id: examId, ownerId: user.id },
      });
      if (!exam) throw new NotFoundException('Exam Not Found');
      /********************************/ 
       //1. Remove Existing Audio and Image Files from File System
      const { audioUrl, imageUrl } = updateSectionDto;
      const section = await this.sectionRepository.getSection(
        examId,
        sectionId,
        user,
      );
      if (section && Boolean(section.imageUrl) && section.imageUrl !== imageUrl) {
        const filename = section.imageUrl.substring(
          section.imageUrl.lastIndexOf('/') + 1,
        );
        const url = `${config.get('deleteImage').url}/${filename}`;
        await axios.delete(url);
      }
      if (section  && Boolean(section.audioUrl)  && section.audioUrl !== audioUrl) {
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
    } catch (e){
      throw new NotFoundException('Exam Not Found')
    }
  }

  async updateWritingSection(
    updateWritingSectionDto: UpdateWritingSectionDto,
    examId: number,
    sectionId: number,
    user: User,
  ): Promise<Section> {
    try{
      /***Check the User's Permission***/
      const exam = await this.examRepository.findOne({
        where: { id: examId, ownerId: user.id },
      });
      if (!exam) throw new NotFoundException('Exam Not Found');
      /**********************************/ 
      //1. Remove Existing Audio and Image Files from File System
      const { imageUrl } = updateWritingSectionDto;
      const section = await this.sectionRepository.getSection(
        examId,
        sectionId,
        user,
      );
      if (section && Boolean(section.imageUrl) && section.imageUrl !== imageUrl) {
        const filename = section.imageUrl.substring(
          section.imageUrl.lastIndexOf('/') + 1,
        );
        const url = `${config.get('deleteImage').url}/${filename}`;
        await axios.delete(url);
      }
      //2. Update the section
      const sectionDto : UpdateSectionDto = {
        title: updateWritingSectionDto.title,
        directions: updateWritingSectionDto.directions,
        imageUrl: updateWritingSectionDto.imageUrl || null,
      }
      const questionDto : CreateQuestionDto = {
        imageUrl: null,
        score: updateWritingSectionDto.score,
        order: null,
        minWords: updateWritingSectionDto.minWords,
        question: updateWritingSectionDto.question,
        htmlExplaination: updateWritingSectionDto.htmlExplaination,
        answers: null
      }
      const questionGroupDto : UpdateQuestionGroupDto = {
        title: "",
        imageUrl: null,
        htmlContent: null,
        questions: [questionDto]
      }
      const updatedSection = await this.sectionRepository.updateSection(
        sectionDto,
        examId,
        sectionId,
        user,
      );
      const updatedQuestionGroup = await this.updateQuestionGroup(
        questionGroupDto, 
        section.id, 
        section.questionGroups[0].id, 
        user)
      updatedSection.questionGroups = updatedQuestionGroup;
      return updatedSection;
    } catch (e){
      throw new NotFoundException('Exam Not Found')
    }
  }


  async removeSection(
    examId: number,
    sectionId: number,
    user: User,
  ): Promise<Section[]> {
    try{
      /***Check the User's Permission***/
      const exam = await this.examRepository.findOne({
        where: { id: examId, ownerId: user.id },
      });
      if (!exam) throw new NotFoundException('Exam Not Found');
      /***************************** */
      //1. Remove Audio and Image Files from File System
      const section = await this.sectionRepository.getSection(
        examId,
        sectionId,
        user,
      );
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
    } catch (e){
      throw new NotFoundException('Exam Not Found')
    }
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
    createQuestionGroupDto: CreateQuestionGroupDto,
    examId: number,
    sectionId: number,
    user: User,
  ): Promise<QuestionGroup[]> {
    try{
      /***Check the User's Permission***/
      const exam = await this.examRepository.findOne({
        where: { id: examId, ownerId: user.id },
      });
      if (!exam) throw new NotFoundException('Exam Not Found');
      /***************************** */
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
        const question = await this.createQuestion(q, questionGroup.id, user);
        newQuestions.push(question);
      }

      let questionGroups = await this.getQuestionGroups(sectionId, user);
      questionGroups = questionGroups.map((q) => {
        if (q.id === questionGroup.id) q.questions = newQuestions;
        return q;
      });
      return questionGroups;
    } catch (e){
      throw new NotFoundException('Exam Not Found')
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
    try{
      /***Check the User's Permission***/
      const section = await this.sectionRepository.findOne(sectionId)
      if (!section) throw new NotFoundException('Exam Not Found');
      const exam = await this.examRepository.findOne({
        where: { id: section.examId, ownerId: user.id },
      });
      if (!exam) throw new NotFoundException('Exam Not Found');
      /************************************ */

      const { questions, imageUrl } = updateQuestionGroupDto;
      const oldQuestionGroup = await this.getQuestionGroup(questionGroupId, user);
      
      // Delete image of the question group
      if (Boolean(oldQuestionGroup.imageUrl) && oldQuestionGroup.imageUrl !== imageUrl) {
        const filename = oldQuestionGroup.imageUrl.substring(
          oldQuestionGroup.imageUrl.lastIndexOf('/') + 1,
        );
        const url = `${config.get('deleteImage').url}/${filename}`;
        await axios.delete(url);
      }
      // Update and get updated question group
      const questionGroup =
        await this.questionGroupRepository.updateQuestionGroup(
          updateQuestionGroupDto,
          questionGroupId,
          user,
        );

      const questionIds = questionGroup.questions.map((question) => question.id);

      //Delete image file of corresponding questions
      for (let question of questionGroup.questions) {
        if (Boolean(question.imageUrl)) {
          const filename = question.imageUrl.substring(
            question.imageUrl.lastIndexOf('/') + 1,
          );
          const url = `${config.get('deleteImage').url}/${filename}`;
          await axios.delete(url);
        }
      }
      
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
    } catch (e){
      throw new NotFoundException('Exam Not Found')
    }
  }

  async removeQuestionGroup(
    sectionId: number,
    questionGroupId: number,
    user: User,
  ): Promise<QuestionGroup[]> {
    try{
      /***Check the User's Permission***/
      const section = await this.sectionRepository.findOne(sectionId)
      if (!section) throw new NotFoundException('Exam Not Found');
      const exam = await this.examRepository.findOne({
        where: { id: section.examId, ownerId: user.id },
      });
      if (!exam) throw new NotFoundException('Exam Not Found');
      /**********************************/
      const questionGroup =
      await this.questionGroupRepository.getQuestionGroup(
        questionGroupId,
        user,
      );
      // Delete image of the question group
      if (Boolean(questionGroup.imageUrl)) {
        const filename = questionGroup.imageUrl.substring(
          questionGroup.imageUrl.lastIndexOf('/') + 1,
        );
        const url = `${config.get('deleteImage').url}/${filename}`;
        await axios.delete(url);
      }

      //Delete image file of corresponding questions 
        for (let question of questionGroup.questions) {
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
    } catch (e){
      throw new NotFoundException('Exam Not Found')
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
}
