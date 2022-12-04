import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import * as XLSX from 'xlsx';
import { InjectRepository } from '@nestjs/typeorm';
import { uniqueId } from 'lodash';
import { promisify } from 'util';
import * as fs from 'fs';

import {
  CreateQuestionDto,
} from '../dto';
import { User } from '../../auth/entities/user.entity';
import { QuestionGroup } from '../entities/questionGroup.entity';
import { QuestionGroupRepository } from '../repositories/questionGroup.repository';
import { CreateQuestionGroupDto } from '../dto/create-questionGroup.dto';
import {
  IRawQuestionGroupData,
  IRawQuestionsData,
} from '../interface/import.interface';
import { QUESTION_GROUP_TYPES } from '../enum/QuestionGroupType.enum';
import { ExamService } from './exam.service';


@Injectable()
export class ImportService {
  constructor(
    @InjectRepository(QuestionGroupRepository)
    private questionGroupRepository: QuestionGroupRepository,

    private readonly examService: ExamService,
  ) {}

  /************************/
  /*****PROCESS CSV FILE **/
  /************************/
  async importQuestionGroups(key: string, user: User): Promise<QuestionGroup> {
    // 1. Download File from S3
    // 2. Save it at the local dir
    const fileName = (await this.fetchFileFromS3(key)) as string;

    // 3. Read & Process file one by one line
    var workbook = XLSX.readFile(fileName);
    const rawQuestionGroup = workbook.Sheets[workbook.SheetNames[0]]; // get the first worksheet
    const rawQuestions = workbook.Sheets[workbook.SheetNames[1]]; // get the first worksheet
    const parsedQuestionGroup =
      XLSX.utils.sheet_to_json<IRawQuestionGroupData>(rawQuestionGroup); // generate objects
    const parsedQuestions =
      XLSX.utils.sheet_to_json<IRawQuestionsData>(rawQuestions); // generate objects

    // 4. Create corresponding answers, questions, and questionGroups
    const questionGroupData = this.parseQuestionGroup(parsedQuestionGroup);

    let questionsData: CreateQuestionDto[] = [];
    switch (questionGroupData.type) {
      case 1:
        questionsData = this.parseMCQQuestions(parsedQuestions);
        break;
      default:
        break;
    }

    // 4.1. Create question group
    const questionGroup =
      await this.questionGroupRepository.createQuestionGroup(
        questionGroupData,
        null,
        user,
      );
    if (!questionGroup)
      throw new InternalServerErrorException('Something went wrong');

    // 4.2. Create questions and answers
    const newQuestions = [];
    if (questionsData && questionsData.length > 0) {
      for (const q of questionsData) {
        const question = await this.examService.createQuestion(
          q,
          questionGroup.id,
          user,
        );
        newQuestions.push(question);
      }
    }

    // 4.3. Add the newly created questions to the question group
    questionGroup.questions = newQuestions.map((question) => {
        delete question.questionGroup
        delete question.questionGroupId
        return question
    });

    // 5. Remove the file
    const unlinkAsync = promisify(fs.unlink);
    await unlinkAsync(fileName)

    // TODO: Send back error file if any
    return questionGroup;
  }

  async fetchFileFromS3(key: string) {
    // Require neccessary library
    const AWS = require('aws-sdk');
    const fs = require('fs');

    // Configure AWS Client
    const s3 = new AWS.S3({
      region: process.env.AWS_REGION_S3,
      accessKeyId: process.env.AWS_ACCESS_KEY_ID_S3,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY_S3,
    });

    // Create writable stream
    const fileName = `./examsFiles/xlsx/${key}`;
    const writable = fs.createWriteStream(fileName);

    // Get writable from stream
    const stream = await s3
      .getObject({
        Bucket: process.env.XLSX_S3_BUCKET,
        Key: key,
      })
      .createReadStream();

    stream.pipe(writable);

    return new Promise((resolve, reject) => {
      writable.on('finish', () => {
        resolve(fileName);
      });
      writable.on('error', () => {
        reject('Something went wrong');
      });
    });
  }

  parseQuestionGroup(
    parsedQuestionGroup: IRawQuestionGroupData[],
  ): CreateQuestionGroupDto {

    if (parsedQuestionGroup.length === 0)
      throw new BadRequestException('Question Group must not be empty');
    const { Type, Title, Content } = parsedQuestionGroup[0];
    if (
      !Type &&
      QUESTION_GROUP_TYPES[Type] !== 0 &&
      !QUESTION_GROUP_TYPES[Type]
    )
      throw new BadRequestException('Correct Type is required');

    return {
      type: QUESTION_GROUP_TYPES[Type],
      title: Title,
      htmlContent: Content,
    };
  }

  parseMCQQuestions(parsedQuestions: IRawQuestionsData[]): CreateQuestionDto[] {
    const questionsData = parsedQuestions.map((item) => {
      const {
        Order,
        Question,
        CorrectOption,
        Option1,
        Option2,
        Option3,
        Option4,
        Score,
        Explaination,
      } = item;

      if (!Order || !Question || !Option1 || !CorrectOption || !Score)
        throw new BadRequestException(
          'Order, Question, Correct Option, Option1, and Score are required',
        );

      let answers = [
        { id: uniqueId(), content: Option1, isRight: CorrectOption === 1 },
      ];

      if (Option2)
        answers.push({
          id: uniqueId(),
          content: Option2,
          isRight: CorrectOption === 2,
        });
      if (Option3)
        answers.push({
          id: uniqueId(),
          content: Option3,
          isRight: CorrectOption === 3,
        });
      if (Option4)
        answers.push({
          id: uniqueId(),
          content: Option4,
          isRight: CorrectOption === 4,
        });

      return {
        order: Order,
        question: Question,
        score: Score,
        htmlExplaination: Explaination,
        answers,
      };
    });

    return questionsData;
  }
}
