import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/auth/entities/user.entity';
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
  ) {}
  /*****CREATE****** */
  async createQuestion(
    createQuestionDto: CreateQuestionDto,
    examId: number,
    user: User,
  ): Promise<Question[]> {
    return await this.questionRepository.createQuestion(
      createQuestionDto,
      examId,
      user,
    );
  }
  /*****READ****** */
  async getQuestionsForStudent(
    examId: number,
    user: User,
  ): Promise<Question[]> {
    return await this.questionRepository.getQuestionsForStudent(
      examId,
      user.id,
    );
  }

  async getQuestionsForTeacher(
    examId: number,
    user: User,
  ): Promise<Question[]> {
    try {
      //Then get questions
      return await this.questionRepository.getQuestionsForTeacher(examId);
    } catch (e) {
      return e;
    }
  }
  /*****UPDATE****** */
  async updateQuestion(
    updateQuestionDto: UpdateQuestionDto,
    examId: number,
    questionId: number,
    user: User,
  ): Promise<Question[]> {
    return await this.questionRepository.updateQuestion(
      updateQuestionDto,
      examId,
      questionId,
      user,
    );
  }

  async updateAnswer(
    createAnswerDto: CreateTeacherAnswerDto,
    examId: number,
    questionId: number,
    user: User,
  ): Promise<Question[]> {
    try {
      return await this.questionRepository.updateAnswer(
        createAnswerDto,
        examId,
        questionId,
      );
    } catch (e) {
      return e;
    }
  }

  /*****DELETE****** */
  async deleteQuestionForStudent(
    questionId: number,
    examId: number,
    user: User,
  ): Promise<Question[]> {
    return await this.questionRepository.deleteQuestionForStudent(
      questionId,
      examId,
      user,
    );
  }

  async deleteQuestionsForTeacher(
    idList: string[],
    examId: number,
    user: User,
  ): Promise<Question[]> {
    try {
      //Then get questions
      return await this.questionRepository.deleteQuestionsForTeacher(
        idList,
        examId,
      );
    } catch (e) {
      return e;
    }
  }
}
