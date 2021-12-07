import { NotFoundException } from '@nestjs/common';
import { User } from 'src/auth/entities/user.entity';
import { EntityRepository, getConnection, Repository } from 'typeorm';
import { CreateSectionDto } from '../dto/create-section.dto';
import { UpdateSectionDto } from '../dto/update-section.dto';
import { Answer } from '../entities/answer.entity';
import { Exam } from '../entities/exam.entity';
import { Question } from '../entities/question.entity';
import { QuestionGroup } from '../entities/questionGroup.entity';
import { Section } from '../entities/section.entity';

@EntityRepository(Section)
export class SectionRepository extends Repository<Section> {
  async getSections(examId: number, user: User): Promise<Section[]> {
    return await this.find({ where: { examId, ownerId: user.id } });
  }

  async createSection(
    createSectionDto: CreateSectionDto,
    exam: Exam,
    user: User,
  ): Promise<Section> {
    const {
      title,
      audioUrl,
      imageUrl,
      htmlContent,
      directions,
      transcription,
    } = createSectionDto;
    const s = new Section();
    s.title = title;
    if (audioUrl) s.audioUrl = audioUrl;

    if (imageUrl) s.imageUrl = imageUrl;
    else s.imageUrl = null;

    if (htmlContent) s.htmlContent = htmlContent;
    if (directions) s.directions = directions;
    if (transcription) s.transcript = transcription;
    s.ownerId = user.id;
    s.exam = exam;
    s.examId = exam.id;
    await s.save();
    return s;
  }

  async getSection(
    examId: number,
    sectionId: number,
    user: User,
  ): Promise<Section> {
    const section = await this.findOne({
      where: { id: sectionId, examId, ownerId: user.id },
    });
    if (!section) throw new NotFoundException('Section Not Found');
    return section;
  }

  async updateSection(
    updateQuestionDto: UpdateSectionDto,
    examId: number,
    sectionId: number,
    user: User,
  ) {
    const {
      title,
      imageUrl,
      audioUrl,
      htmlContent,
      directions,
      transcription,
    } = updateQuestionDto;
    const s: Section = await this.getSection(examId, sectionId, user);
    if (title) s.title = title;
    if (audioUrl) s.audioUrl = audioUrl;
    else s.audioUrl = null;

    if (imageUrl) s.imageUrl = imageUrl;
    else s.imageUrl = null;

    if (directions) s.directions = directions;
    if (htmlContent) s.htmlContent = htmlContent;
    if (transcription) s.transcript = transcription;
    await s.save();
    return s;
  }

  async removeSection(examId: number, sectionId: number, user: User) {
    const s: Section = await this.getSection(examId, sectionId, user);
    if (!s) throw new NotFoundException('Section Not Found');
    // Get necessary helpers
    const { batchDeleteImage } = require('../shared/helpers');

    const questionGroups: QuestionGroup[] = await getConnection()
      .createQueryBuilder()
      .select('id')
      .from(QuestionGroup, 'questionGroup')
      .where('questionGroup.sectionId = :sectionId', { sectionId })
      .getMany();

    if (questionGroups.length > 0) {
      const questionGroupIds = questionGroups.map(
        (questionGroup) => questionGroup.id,
      );

      // 1. Delete Images of Corresponding Question Groups
      const questionGrpImgArr: string[] = [];
      questionGroups.forEach((qG) => {
        if (qG.imageUrl && !qG.imageUrl.includes('/')) {
          const fileName = qG.imageUrl;
          if (fileName) questionGrpImgArr.push(fileName);
        }
      });
      if (questionGrpImgArr.length > 0)
        await batchDeleteImage(questionGrpImgArr);

      const questions: Question[] = await getConnection()
        .createQueryBuilder()
        .select('id')
        .from(Question, 'question')
        .where('question.questionGroupId IN (:...questionGroupIds)', {
          questionGroupIds: [...questionGroupIds],
        })
        .getMany();

      if (questions.length > 0) {
        const questionIds = questions.map((question) => question.id);

        // 2. Delete Images of Corresponding Questions
        const questionImgArr: string[] = [];
        questions.forEach((q) => {
          if (q.imageUrl && !q.imageUrl.includes('/')) {
            const fileName = q.imageUrl;
            if (fileName) questionImgArr.push(fileName);
          }
        });
        if (questionImgArr.length > 0) await batchDeleteImage(questionImgArr);

        // 3. Delete Answers
        await getConnection()
          .createQueryBuilder()
          .delete()
          .from(Answer)
          .where('questionId IN (:...questionIds)', {
            questionIds: [...questionIds],
          })
          .execute();
        // 4. Delete Questions
        await getConnection()
          .createQueryBuilder()
          .delete()
          .from(Question)
          .where('id IN (:...questionIds)', { questionIds: [...questionIds] })
          .execute();
      }
      // 5. Delete Question Group
      await getConnection()
        .createQueryBuilder()
        .delete()
        .from(QuestionGroup)
        .where('id IN (:...questionGroupIds)', {
          questionGroupIds: [...questionGroupIds],
        })
        .execute();
    }
    // 6. Delete Section
    await getConnection()
      .createQueryBuilder()
      .delete()
      .from(Section)
      .where('id = :sectionId', { sectionId })
      .execute();
  }
}
