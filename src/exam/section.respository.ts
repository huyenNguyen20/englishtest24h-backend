import axios from 'axios';
import * as config from 'config';
import { NotFoundException } from '@nestjs/common';
import { User } from 'src/auth/entities/user.entity';
import { EntityRepository, getConnection, Repository } from 'typeorm';
import { CreateSectionDto } from './dto/create-section.dto';
import { UpdateSectionDto } from './dto/update-section.dto';
import { Answer } from './entities/answer.entity';
import { Exam } from './entities/exam.entity';
import { Question } from './entities/question.entity';
import { QuestionGroup } from './entities/questionGroup.entity';
import { Section } from './entities/section.entity';

@EntityRepository(Section)
export class SectionRepository extends Repository<Section> {
  async getSections(examId: number, user: User): Promise<Section[]> {
    return await this.find({ where: { examId, ownerId: user.id } });
  }

  async createSection(
    createSectionDto: any,
    exam: Exam,
    user: User,
  ): Promise<Section> {
    const { title, audioUrl, imageUrl, htmlContent, directions, transcript } =
      createSectionDto;
    const s = new Section();
    s.title = title;
    if (audioUrl) s.audioUrl = audioUrl;

    if (imageUrl) s.imageUrl = imageUrl;
    else s.imageUrl = null;

    if (htmlContent) s.htmlContent = htmlContent;
    if (directions) s.directions = directions;
    if (transcript) s.transcript = transcript;
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
  ): Promise<Section> {
    const {
      title,
      imageUrl,
      audioUrl,
      htmlContent,
      directions,
      transcription,
    } = updateQuestionDto;
    const s = await this.getSection(examId, sectionId, user);
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
    const s = await this.getSection(examId, sectionId, user);
    const questionGroups = await getConnection()
      .createQueryBuilder()
      .select('id')
      .from(QuestionGroup, 'questionGroup')
      .where('questionGroup.sectionId = :sectionId', { sectionId })
      .execute();
    if (questionGroups.length > 0) {
      const questionGroupIds = questionGroups.map(
        (questionGroup) => questionGroup.id,
      );

      // 1. Delete Images of Corresponding Question Groups
      for (const questionGroup of questionGroups) {
        if (Boolean(questionGroup.imageUrl)) {
          const filename = questionGroup.imageUrl.substring(
            questionGroup.imageUrl.lastIndexOf('/') + 1,
          );
          const url = `${config.get('deleteImage').url}/${filename}`;
          await axios.delete(url);
        }
      }

      const questions = await getConnection()
        .createQueryBuilder()
        .select('id')
        .from(Question, 'question')
        .where('question.questionGroupId IN (:...questionGroupIds)', {
          questionGroupIds: [...questionGroupIds],
        })
        .execute();

      if (questions.length > 0) {
        const questionIds = questions.map((question) => question.id);

        // 2. Delete Images of Corresponding Questions
        for (const question of questions) {
          if (Boolean(question.imageUrl)) {
            const filename = question.imageUrl.substring(
              question.imageUrl.lastIndexOf('/') + 1,
            );
            const url = `${config.get('deleteImage').url}/${filename}`;
            await axios.delete(url);
          }
        }
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
