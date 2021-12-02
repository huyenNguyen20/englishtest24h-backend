import { NotFoundException } from '@nestjs/common';
import { User } from 'src/auth/entities/user.entity';
import { EntityRepository, getConnection, Repository } from 'typeorm';
import { CreateQuestionGroupDto } from './dto/create-questionGroup.dto';
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
    createQuestionGroupDto: CreateQuestionGroupDto,
    section: Section,
    user: User,
  ): Promise<QuestionGroup> {
    const { type, title, htmlContent, imageUrl, matchingOptions } =
      createQuestionGroupDto;
    const q = new QuestionGroup();
    q.title = title || '';
    if (htmlContent) q.htmlContent = htmlContent;
    if (matchingOptions) q.matchingOptions = matchingOptions;
    if (imageUrl) q.imageUrl = imageUrl;
    else q.imageUrl = null;

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
    const questionGroup: QuestionGroup = await this.findOne({
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
    const { title, htmlContent, imageUrl, matchingOptions } =
      updateQuestionGroupDto;
    const q: QuestionGroup = await this.findOne(questionGroupId);
    if (title) q.title = title;
    if (htmlContent) q.htmlContent = htmlContent;
    if (Boolean(matchingOptions)) q.matchingOptions = matchingOptions;
    if (imageUrl) q.imageUrl = imageUrl;
    else q.imageUrl = null;

    await q.save();
    return q;
  }

  async removeQuestionGroup(questionGroupId: number, user: User) {
    const questionGroup: QuestionGroup = await this.findOne({
      where: { id: questionGroupId, ownerId: user.id },
    });
    if (!questionGroup) throw new NotFoundException('Question Group Not Found');

    // Get neccessary helper functions
    const { batchDeleteImage } = require('../shared/helpers');

    const questions: Question[] = await getConnection()
      .createQueryBuilder()
      .select('id')
      .from(Question, 'question')
      .where('question.questionGroupId = :questionGroupId', { questionGroupId })
      .getMany();
    if (questions.length > 0) {
      const questionIds = questions.map((question) => question.id);

      // 1. Delete Images of Corresponding Questions
      const questionImgArr: string[] = [];
      questions.forEach((q) => {
        if (q.imageUrl && !q.imageUrl.includes('/')) {
          const fileName = q.imageUrl;
          if (fileName) questionImgArr.push(fileName);
        }
      });
      if (questionImgArr.length > 0) await batchDeleteImage(questionImgArr);

      // 2. Delete corresponding answers
      await getConnection()
        .createQueryBuilder()
        .delete()
        .from(Answer)
        .where('questionId IN (:...questionIds)', {
          questionIds: [...questionIds],
        })
        .execute();
      // 3. Delete corresponding questions
      await getConnection()
        .createQueryBuilder()
        .delete()
        .from(Question)
        .where('id IN (:...questionIds)', { questionIds: [...questionIds] })
        .execute();
    }
    // 3. Delete question group
    await getConnection()
      .createQueryBuilder()
      .delete()
      .from(QuestionGroup)
      .where('id = :questionGroupId', { questionGroupId })
      .execute();
  }
}
