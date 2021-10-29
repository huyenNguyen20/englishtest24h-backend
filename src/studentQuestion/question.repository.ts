import {
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { User } from 'src/auth/entities/user.entity';
import { EntityRepository, getConnection, Repository } from 'typeorm';
import { CreateTeacherAnswerDto } from './dto/create-answer.dto';
import { CreateQuestionDto } from './dto/create-question.dto';
import { UpdateQuestionDto } from './dto/update-question.dto';
import { StudentQuestion as Question } from './entities/question.entity';

@EntityRepository(Question)
export class StudentQuestionRepository extends Repository<Question> {
  /*****CREATE****** */
  //Method for STUDENT to create their questions
  async createQuestion(
    createQuestionDto: CreateQuestionDto,
    examId: number,
    user: User,
  ): Promise<Question[]> {
    try {
      const newQuestion = new Question();
      const { question } = createQuestionDto;
      newQuestion.question = question;
      newQuestion.examId = examId;
      newQuestion.userId = user.id;
      await newQuestion.save();
      return await this.getQuestionsForStudent(examId, user.id);
    } catch (e) {
      throw new BadRequestException('Something went wrong. Please try again');
    }
  }
  /*****READ****** */
  //Methods for STUDENTS to get their questions for one exam
  async getQuestionsForStudent(examId: number, userId: number): Promise<Question[]> {
    return await this.find({ examId, userId });
  }

  //Methods for TEACHER to get all students' questions for one exam
  async getQuestionsForTeacher(examId: number): Promise<Question[]> {
    return await this.find({ examId });
  }
  /*****UPDATE****** */
  //Method for STUDENT to edit their questions
  async updateQuestion(
    updateQuestionDto: UpdateQuestionDto,
    examId: number,
    questionId: number,
    user: User,
  ): Promise<Question[]> {
    const whereClause = { id: questionId, userId: user.id }
    const oldQuestion = await this.findOne({ where: whereClause });
    if (!oldQuestion) throw new NotFoundException('Question Not Found');
    const { question } = updateQuestionDto;
    oldQuestion.question = question;
    await oldQuestion.save();
    return await this.getQuestionsForStudent(examId, user.id);
  }

  //Method for TEACHER to post/edit their answers to students' question
  async updateAnswer(
    createAnswerDto: CreateTeacherAnswerDto,
    examId: number,
    questionId: number,
  ): Promise<Question[]> {
    const oldQuestion = await this.findOne(questionId);
    if (!oldQuestion) throw new NotFoundException('Question Not Found');
    const { answer } = createAnswerDto;
    oldQuestion.teacherAnswer = answer;
    await oldQuestion.save();
    return await this.getQuestionsForTeacher(examId);
  }

  /*****DELETE****** */
  //Method for STUDENT to delete their questions
  async deleteQuestionForStudent(
    questionId: number,
    examId: number,
    user: User,
  ): Promise<Question[]> {
    const question = await this.findOne({where: {id: questionId, userId: user.id}});
    if (!question) throw new NotFoundException('Question Not Found');
    await getConnection()
      .createQueryBuilder()
      .delete()
      .from(Question)
      .where('id =:questionId', { questionId })
      .execute();

    return await this.getQuestionsForStudent(examId, user.id);
  }

  //Method for TEACHER to delete questions of one exam
  async deleteQuestionsForTeacher(
    idList: string[],
    examId: number,
  ): Promise<Question[]> {
    await getConnection()
      .createQueryBuilder()
      .delete()
      .from(Question)
      .where('id IN (:...Ids)', { Ids: [...idList] })
      .execute();

    return await this.getQuestionsForTeacher(examId);
  }
}

