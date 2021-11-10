import { NotFoundException } from '@nestjs/common';
import { User } from 'src/auth/entities/user.entity';
import { EntityRepository, getConnection, Repository } from 'typeorm';
import { CreateAnswerDto } from './dto/create-answer.dto';
import { UpdateAnswerDto } from './dto/update-answer.dto';
import { Answer } from './entities/answer.entity';
import { Question } from './entities/question.entity';

@EntityRepository(Answer)
export class AnswerRepository extends Repository<Answer> {
  async getAnswers(questionId: number, user: User): Promise<Answer[]> {
    return await this.find({ where: { questionId, ownerId: user.id } });
  }

  async createAnswer(
    createAnswerDto: CreateAnswerDto,
    question: Question,
    user: User,
  ): Promise<Answer> {
    const { id, content, isRight } = createAnswerDto;
    const a = new Answer();
    a.id = id;
    a.content = content;
    a.isRight = isRight;
    a.question = question;
    a.questionId = question.id;
    a.ownerId = user.id;
    await a.save();
    return a;
  }

  async getAnswer(answerId: number, user: User): Promise<Answer> {
    const answer = await this.findOne({
      where: { id: answerId, ownerId: user.id },
    });
    if (!answer) throw new NotFoundException('Answer Not Found');
    return answer;
  }

  async updateAnswer(
    updateAnswerDto: UpdateAnswerDto,
    answerId: number,
    user: User,
  ): Promise<void> {
    const { content, isRight } = updateAnswerDto;
    const a = await this.getAnswer(answerId, user);

    if (content) a.content = content;
    if (isRight) a.isRight = isRight;
    await a.save();
  }

  async removeAnswer(answerId: number) {
    await getConnection()
      .createQueryBuilder()
      .delete()
      .from(Answer)
      .where('id = :answerId', { answerId })
      .execute();
  }
}
