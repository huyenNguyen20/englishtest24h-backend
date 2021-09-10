import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Param,
  Delete,
  ParseIntPipe,
  UseGuards,
  ValidationPipe,
  UseInterceptors,
  UploadedFiles,
  BadRequestException,
  Query,
} from '@nestjs/common';
import { ExamService } from './exam.service';
import {
  CreateExamDto,
  UpdateExamDto,
  FilterExamDto,
} from './dto';
// import { examtatusValidationPipe } from './pipes/task-status-validation.pipe';
import { AuthGuard } from '@nestjs/passport';
import { getUser } from 'src/auth/decorator/getUser.decorator';
import { User } from 'src/auth/entities/user.entity';
import { ExamValidationPipe } from './pipes/exam.pipe';
import {
  FileFieldsInterceptor,
} from '@nestjs/platform-express';
import { Exam } from './entities/exam.entity';
import { ExamFilterValidationPipe } from './pipes/exam-filter.pipe';
import { Section } from './entities/section.entity';
import { CreateSectionDto } from './dto/create-section.dto';
import { UpdateSectionDto } from './dto/update-section.dto';
import { QuestionGroup } from './entities/questionGroup.entity';
import { UpdateQuestionGroupDto } from './dto/update-questionGroup.dto';
import { QuestionGroupValidationPipe } from './pipes/questionGroup.pipe';
import { CreateQuestionGroupDto } from './dto/create-questionGroup.dto';
import { UpdateRatingDto } from './dto/update-rating.dto';
import * as config from 'config';

@Controller('exams')
export class ExamController {
  constructor(private readonly examService: ExamService) {}

  /********************* */
  /***Exam Routes for Public Users***/
  /********************* */

  @Get('/published')
  async getPublishedExams(
    @Query(new ExamFilterValidationPipe()) filterExamDto: FilterExamDto,
  ): Promise<Exam[]> {
    return await this.examService.getPublishedExams(filterExamDto);
  }

  @Get('/published/latest')
  async getLatestExams(): Promise<Exam[]> {
    return await this.examService.getLatestExams();
  }

  @Get('/published/related/:examId')
  async getRelatedExams(
    @Param('examId', ParseIntPipe) examId: number,
  ): Promise<Exam[]> {
    return await this.examService.getRelatedExams(examId);
  }

  @Get('/subjects')
  async getSubject(): Promise<Exam[]> {
    return await this.examService.getSubjects();
  }

  @Get('/questionTypes')
  async getQuestionTypes(): Promise<string[]> {
    return await this.examService.getQuestionTypes();
  }

  @Get('/published/:examId/examDetails')
  async getExamDetails(
    @Param('examId', ParseIntPipe) examId: number,
  ): Promise<Exam> {
    return await this.examService.getPublishedExam(examId);
  }

  @Get('/published/:examId')
  @UseGuards(AuthGuard())
  async getExamForTestTaker(
    @Param('examId', ParseIntPipe) examId: number,
  ): Promise<{ exam: Exam; sections: Section[] }> {
    return await this.examService.getExamForTestTaker(examId);
  }

  @Post('/published/:examId/updateRating')
  @UseGuards(AuthGuard())
  async updateExamRating(
    @Param('examId', ParseIntPipe) examId: number,
    @Body(new ValidationPipe()) updateRatingDto: UpdateRatingDto,
  ): Promise<void> {
    return await this.examService.updateExamRating(
      updateRatingDto.rating,
      examId,
    );
  }
  /********************* */
  /***Exam Routes for Owner***/
  /********************* */

  @Get()
  @UseGuards(AuthGuard())
  async getExams(@getUser() user: User): Promise<Exam[]> {
    return await this.examService.getExams(user);
  }

  @Post()
  @UseGuards(AuthGuard())
  @UseInterceptors(FileFieldsInterceptor([{ name: 'image', maxCount: 1 }]))
  async createExam(
    @UploadedFiles() files,
    @Body(new ExamValidationPipe()) createExamDto: CreateExamDto,
    @getUser() user: User,
  ): Promise<Exam[]> {
    if (
      files &&
      files.image &&
      !files.image[0].originalname.toLowerCase().match(/\.(jpg|jpeg|gif|png)/)
    )
      throw new BadRequestException('Must be An Image File');
    let createExam = {};
    let imageUrl;
    if (files && files.image) {
      imageUrl = `${config.get('server.url')}/examsFiles/${
        files.image[0].filename
      }`;
      createExam = { ...createExamDto, imageUrl };
    } else createExam = { ...createExamDto };
    return await this.examService.createExam(createExam, user);
  }

  @Get('/:examId')
  @UseGuards(AuthGuard())
  async getExam(
    @Param('examId', ParseIntPipe) examId: number,
    @getUser() user: User,
  ): Promise<Exam> {
    return await this.examService.getExam(examId, user);
  }

  @Put('/:examId')
  @UseGuards(AuthGuard())
  @UseInterceptors(FileFieldsInterceptor([{ name: 'image', maxCount: 1 }]))
  async updateExam(
    @UploadedFiles() files,
    @Body(new ExamValidationPipe()) updateExamDto: UpdateExamDto,
    @Param('examId', ParseIntPipe) examId: number,
    @getUser() user: User,
  ): Promise<Exam[]> {
    if (
      files &&
      files.image &&
      !files.image[0].originalname.toLowerCase().match(/\.(jpg|jpeg|gif|png)/)
    )
      throw new BadRequestException('Must be An Image File');
    let updateExam = {};
    let imageUrl;
    if (files && files.image) {
      imageUrl = `${config.get('server.url')}/examsFiles/${
        files.image[0].filename
      }`;
      updateExam = { ...updateExamDto, imageUrl };
    } else updateExam = { ...updateExamDto };
    return await this.examService.updateExam(updateExam, examId, user);
  }

  @Put('/:examId/published')
  @UseGuards(AuthGuard())
  async togglePublishExam(
    @Param('examId', ParseIntPipe) examId: number,
    @getUser() user: User,
  ): Promise<Exam[]> {
    return await this.examService.togglePublishExam(examId, user);
  }

  @Delete('/:examId')
  @UseGuards(AuthGuard())
  async removeExam(
    @Param('examId', ParseIntPipe) examId: number,
    @getUser() user: User,
  ): Promise<Exam[]> {
    return await this.examService.removeExam(examId, user);
  }

  /********************* */
  /***Sections***/
  /********************* */

  @Get('/:examId/sections')
  @UseGuards(AuthGuard())
  async getSections(
    @Param('examId', ParseIntPipe) examId: number,
    @getUser() user: User,
  ): Promise<Section[]> {
    return await this.examService.getSections(examId, user);
  }

  @Post('/:examId/sections')
  @UseGuards(AuthGuard())
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'image', maxCount: 1 },
      { name: 'audio', maxCount: 1 },
    ]),
  )
  async createSection(
    @UploadedFiles() files,
    @Body(new ValidationPipe()) createSectionDto: CreateSectionDto,
    @Param('examId', ParseIntPipe) examId: number,
    @getUser() user: User,
  ) {
    if (
      files &&
      files.image &&
      !files.image[0].originalname.toLowerCase().match(/\.(jpg|jpeg|gif|png)/)
    )
      throw new BadRequestException('Must be An Image File');
    if (
      files &&
      files.audio &&
      !files.audio[0].originalname.toLowerCase().match(/\.(wav|mp3)/)
    )
      throw new BadRequestException('Must be An Audio File');
    let createSection = {};
    let imageUrl, audioUrl;
    if (files && files.image && files.audio) {
      imageUrl = `${config.get('server.url')}/examsFiles/${
        files.image[0].filename
      }`;
      audioUrl = `${config.get('server.url')}/examsFiles/${
        files.audio[0].filename
      }`;
      createSection = { ...createSectionDto, imageUrl, audioUrl };
    } else if (files && files.image && !files.audio) {
      imageUrl = `${config.get('server.url')}/examsFiles/${
        files.image[0].filename
      }`;
      createSection = { ...createSectionDto, imageUrl };
    } else if (files && !files.image && files.audio) {
      audioUrl = `${config.get('server.url')}/examsFiles/${
        files.audio[0].filename
      }`;
      createSection = { ...createSectionDto, audioUrl };
    } else {
      createSection = { ...createSectionDto };
    }
    return await this.examService.createSection(createSection, examId, user);
  }

  @Get('/:examId/sections/:sectionId')
  @UseGuards(AuthGuard())
  async getSection(
    @Param('examId', ParseIntPipe) examId: number,
    @Param('sectionId', ParseIntPipe) sectionId: number,
    @getUser() user: User,
  ): Promise<Section> {
    return await this.examService.getSection(examId, sectionId, user);
  }

  @Put('/:examId/sections/:sectionId')
  @UseGuards(AuthGuard())
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'image', maxCount: 1 },
      { name: 'audio', maxCount: 1 },
    ]),
  )
  async updateSection(
    @UploadedFiles() files,
    @Body(new ValidationPipe()) updateSectionDto: UpdateSectionDto,
    @Param('examId', ParseIntPipe) examId: number,
    @Param('sectionId', ParseIntPipe) sectionId: number,
    @getUser() user: User,
  ): Promise<Section> {
    if (
      files &&
      files.image &&
      !files.image[0].originalname.toLowerCase().match(/\.(jpg|jpeg|gif|png)/)
    )
      throw new BadRequestException('Must be An Image File');
    if (
      files &&
      files.audio &&
      !files.audio[0].originalname.toLowerCase().match(/\.(wav|mp3)/)
    )
      throw new BadRequestException('Must be An Audio File');
    let updateSection = {};
    let imageUrl, audioUrl;
    if (files && files.image && files.audio) {
      imageUrl = `${config.get('server.url')}/examsFiles/${
        files.image[0].filename
      }`;
      audioUrl = `${config.get('server.url')}/examsFiles/${
        files.audio[0].filename
      }`;
      updateSection = { ...updateSectionDto, imageUrl, audioUrl };
    } else if (files && files.image && !files.audio) {
      imageUrl = `${config.get('server.url')}/examsFiles/${
        files.image[0].filename
      }`;
      updateSection = { ...updateSectionDto, imageUrl };
    } else if (files && !files.image && files.audio) {
      audioUrl = `${config.get('server.url')}/examsFiles/${
        files.audio[0].filename
      }`;
      updateSection = { ...updateSectionDto, audioUrl };
    } else {
      updateSection = { ...updateSectionDto };
    }
    return await this.examService.updateSection(
      updateSection,
      examId,
      sectionId,
      user,
    );
  }

  @Delete('/:examId/sections/:sectionId')
  @UseGuards(AuthGuard())
  async removeSection(
    @Param('examId', ParseIntPipe) examId: number,
    @Param('sectionId', ParseIntPipe) sectionId: number,
    @getUser() user: User,
  ): Promise<Section[]> {
    return await this.examService.removeSection(examId, sectionId, user);
  }

  /********************* */
  /***Question Groups***/
  /********************* */

  @Get('/:examId/sections/:sectionId/questionGroups')
  @UseGuards(AuthGuard())
  async getQuestionGroups(
    @Param('examId', ParseIntPipe) examId: number,
    @Param('sectionId', ParseIntPipe) sectionId: number,
    @getUser() user: User,
  ): Promise<QuestionGroup[]> {
    return await this.examService.getQuestionGroups(sectionId, user);
  }

  @Post('/:examId/sections/:sectionId/questionGroups')
  @UseGuards(AuthGuard())
  async createQuestionGroups(
    @Body(new QuestionGroupValidationPipe())
    createQuestionGroupDto: CreateQuestionGroupDto,
    @Param('examId', ParseIntPipe) examId: number,
    @Param('sectionId', ParseIntPipe) sectionId: number,
    @getUser() user: User,
  ): Promise<QuestionGroup[]> {
    return await this.examService.createQuestionGroup(
      createQuestionGroupDto,
      examId,
      sectionId,
      user,
    );
  }

  @Put('/:examId/sections/:sectionId/questionGroups/:questionGroupId')
  @UseGuards(AuthGuard())
  async updateQuestionGroup(
    @Body(new QuestionGroupValidationPipe())
    updateQuestionGroupDto: UpdateQuestionGroupDto,
    @Param('examId', ParseIntPipe) examId: number,
    @Param('sectionId', ParseIntPipe) sectionId: number,
    @Param('questionGroupId', ParseIntPipe) questionGroupId: number,
    @getUser() user: User,
  ): Promise<QuestionGroup[]> {
    return await this.examService.updateQuestionGroup(
      updateQuestionGroupDto,
      sectionId,
      questionGroupId,
      user,
    );
  }

  @Delete('/:examId/sections/:sectionId/questionGroups/:questionGroupId')
  @UseGuards(AuthGuard())
  async removeQuestionGroup(
    @Param('examId', ParseIntPipe) examId: number,
    @Param('sectionId', ParseIntPipe) sectionId: number,
    @Param('questionGroupId', ParseIntPipe) questionGroupId: number,
    @getUser() user: User,
  ): Promise<QuestionGroup[]> {
    return await this.examService.removeQuestionGroup(
      sectionId,
      questionGroupId,
      user,
    );
  }
}
