import { BadRequestException, NotFoundException } from '@nestjs/common';
import { User } from 'src/auth/entities/user.entity';
import { EntityRepository, getConnection, Repository } from 'typeorm';
import { UpdateQuestionGroupDto } from './dto/update-questionGroup.dto';
import { Answer } from './entities/answer.entity';
import { Question } from './entities/question.entity';
import {
  QuestionGroup,
  QuestionGroupTypes,
} from './entities/questionGroup.entity';
import { Section } from './entities/section.entity';

@EntityRepository(QuestionGroup)
export class QuestionGroupRepository extends Repository<QuestionGroup> {
  async getQuestionTypes(): Promise<string[]> {
    return Object.values(QuestionGroupTypes);
  }

  async getQuestionGroups(sectionId, user: User): Promise<QuestionGroup[]> {
    return this.find({ where: { sectionId, ownerId: user.id } });
  }

  async createQuestionGroup(
    createQuestionGroupDto: any,
    section: Section,
    user: User,
  ): Promise<QuestionGroup> {
    const { type, title, htmlContent } = createQuestionGroupDto;
    const q = new QuestionGroup();
    q.title = title;
    if (htmlContent) q.htmlContent = htmlContent;
    q.type = type;
    q.ownerId = user.id;
    q.section = section;
    q.sectionId = section.id;
    await q.save();
    return q;
  }

  async getQuestionGroup(
    questionGroupId: number,
    user: User,
  ): Promise<QuestionGroup> {
    const questionGroup = await this.findOne({
      where: {
        id: questionGroupId,
        ownerId: user.id,
      },
    });
    if (!questionGroup) throw new NotFoundException('Section Not Found');
    return questionGroup;
  }

  async updateQuestionGroup(
    updateQuestionGroupDto: UpdateQuestionGroupDto,
    questionGroupId: number,
    user: User,
  ): Promise<QuestionGroup> {
    const { title, htmlContent } = updateQuestionGroupDto;
    const q = await this.findOne(questionGroupId);
    if (title) q.title = title;
    if (htmlContent) q.htmlContent = htmlContent;
    await q.save();
    return q;
  }

  async removeQuestionGroup(questionGroupId: number, user: User) {
    const questionGroup = this.findOne({
      where: { id: questionGroupId, ownerId: user.id },
    });
    const questions = await getConnection()
      .createQueryBuilder()
      .select('id')
      .from(Question, 'question')
      .where('question.questionGroupId = :questionGroupId', { questionGroupId })
      .execute();
    if (questions.length > 0) {
      const questionIds = questions.map((question) => question.id);
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
    await getConnection()
      .createQueryBuilder()
      .delete()
      .from(QuestionGroup)
      .where('id = :questionGroupId', { questionGroupId })
      .execute();
  }
}
