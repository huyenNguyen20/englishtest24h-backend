import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/auth/entities/user.entity';
import { ExamService } from 'src/exam/exam.service';
import { CreateTeacherAnswerDto } from './dto/create-answer.dto';
import { CreateQuestionDto } from './dto/create-question.dto';
import { UpdateQuestionDto } from './dto/update-question.dto';
import { StudentQuestion as Question } from './entities/question.entity';
import { StudentQuestionRepository } from './question.repository';

@Injectable()
export class StudentQuestionService {
  constructor(
    @InjectRepository(StudentQuestionRepository)
    private questionRepository: StudentQuestionRepository,

    private readonly examService: ExamService
  ) {}
  /*****CREATE****** */
  //Method for STUDENT to create their questions
  async createQuestion(
    createQuestionDto: CreateQuestionDto,
    examId: number,
    user: User,
  ): Promise<Question[]> {
    return await this.questionRepository.createQuestion(createQuestionDto, examId, user);
  }
  /*****READ****** */
  //Methods for STUDENTS to get their questions for one exam
  async getQuestionsForStudent(examId: number, user: User): Promise<Question[]> {
    return await this.questionRepository.getQuestionsForStudent(examId, user.id);
  }

  //Methods for TEACHER to get all students' questions for one exam
  async getQuestionsForTeacher(examId: number, user: User): Promise<Question[]> {
    try {
      //Check if user has teacher permission
      await this.examService.getExam(examId, user);
      //Then get questions
      return await this.questionRepository.getQuestionsForTeacher(examId);
    } catch (e){
      return e;
    }
  }
  /*****UPDATE****** */
  //Method for STUDENT to edit their question
  async updateQuestion(
    updateQuestionDto: UpdateQuestionDto,
    examId: number,
    questionId: number,
    user: User,
  ): Promise<Question[]> {
    return await this.questionRepository.updateQuestion(updateQuestionDto, examId, questionId, user);
  }

  //Method for TEACHER to post/edit their answers to students' question
  async updateAnswer(
    createAnswerDto: CreateTeacherAnswerDto,
    examId: number,
    questionId: number,
    user: User
  ): Promise<Question[]> {
    try {
      //Check if user has teacher permission
      await this.examService.getExam(examId, user);
      //Then get questions
      return await this.questionRepository.updateAnswer(createAnswerDto, examId, questionId);
    } catch (e){
      return e;
    }
  }

  /*****DELETE****** */
  //Method for STUDENT to delete their questions
  async deleteQuestionForStudent(
    questionId: number,
    examId: number,
    user: User,
  ): Promise<Question[]> {
    return await this.questionRepository.deleteQuestionForStudent(questionId, examId, user);
  }

  //Method for TEACHER to delete questions of one exam
  async deleteQuestionsForTeacher(
    idList: string[],
    examId: number,
    user: User,
  ): Promise<Question[]> {
    try {
      //Check if user has teacher permission
      await this.examService.getExam(examId, user);
      //Then get questions
      return await this.questionRepository.deleteQuestionsForTeacher(idList, examId);
    } catch (e){
      return e;
    }
  }
}
