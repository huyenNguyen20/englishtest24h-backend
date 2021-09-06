import { EntityRepository, getConnection, Repository } from 'typeorm';
import { User } from 'src/auth/entities/user.entity';
import { Question } from './entities/question.entity';
import { CreateQuestionDto, UpdateQuestionDto } from './dto';
import { NotFoundException } from '@nestjs/common';
import { QuestionGroup } from './entities/questionGroup.entity';
import { Answer } from './entities/answer.entity';

@EntityRepository(Question)
export class QuestionRepository extends Repository<Question> {
  async getQuestions(questionGroupId: number, user: User): Promise<Question[]> {
    return await this.find({ where: { questionGroupId, ownerId: user.id } });
  }

  async createQuestion(
    createQuestionDto: CreateQuestionDto,
    questionGroup: QuestionGroup,
    user: User,
  ): Promise<Question> {
    const { score, question, order, minWords, positionId, htmlExplaination } =
      createQuestionDto;
    const q = new Question();
    q.score = score;
    if (question) q.question = question;
    if (htmlExplaination) q.htmlExplaination = htmlExplaination;
    if (positionId) q.positionId = positionId;
    if (minWords) q.minWords = minWords;
    q.questionGroup = questionGroup;
    q.questionGroupId = questionGroup.id;
    q.ownerId = user.id;
    q.order = order;
    await q.save();
    return q;
  }

  async getQuestion(questionId: number, user: User): Promise<Question> {
    const question = await this.findOne({
      where: { id: questionId, ownerId: user.id },
    });
    if (!question) throw new NotFoundException('Question Not Found');
    return question;
  }

  async updateQuestion(
    updateQuestionDto: UpdateQuestionDto,
    questionGroupId: number,
    questionId: number,
    user: User,
  ): Promise<void> {
    const { order, question, score, minWords, htmlExplaination, positionId } =
      updateQuestionDto;
    const q = await this.getQuestion(questionId, user);

    if (score) q.score = score;
    if (question) q.question = question;
    if (htmlExplaination) q.htmlExplaination = htmlExplaination;
    if (positionId) q.positionId = positionId;
    if (minWords) q.minWords = minWords;
    if (order) q.order = order;
    await q.save();
  }

  async removeQuestion(questionId: number, user: User) {
    const q = await this.getQuestion(questionId, user);
    await getConnection()
      .createQueryBuilder()
      .delete()
      .from(Answer)
      .where('questionId = :questionId', { questionId })
      .execute();
    await getConnection()
      .createQueryBuilder()
      .delete()
      .from(Question)
      .where('id = :questionId', { questionId })
      .execute();
  }
}
