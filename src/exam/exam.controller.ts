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
  Query,
  UseInterceptors,
} from '@nestjs/common';
import { ExamService } from './exam.service';
import { CreateExamDto, UpdateExamDto, FilterExamDto } from './dto';
// import { examtatusValidationPipe } from './pipes/task-status-validation.pipe';
import { AuthGuard } from '@nestjs/passport';
import { getUser } from 'src/auth/decorator/getUser.decorator';
import { User } from 'src/auth/entities/user.entity';
import { ExamValidationPipe } from './pipes/exam.pipe';
import { Exam } from './entities/exam.entity';
import { ExamFilterValidationPipe } from './pipes/exam-filter.pipe';
import { Section } from './entities/section.entity';
import { CreateSectionDto } from './dto/create-section.dto';
import { UpdateSectionDto } from './dto/update-section.dto';
import { QuestionGroup } from './entities/questionGroup.entity';
import { UpdateQuestionGroupDto } from './dto/update-questionGroup.dto';
import { CreateQuestionGroupDto } from './dto/create-questionGroup.dto';
import { UpdateRatingDto } from './dto/update-rating.dto';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CreateWritingSectionDto } from './dto/create-writing-section.dto';
import { UpdateWritingSectionDto } from './dto/update-writing-section.dto';
import { CreateWritingSectionValidationPipe } from './pipes/create-writing-section.pipe';
import { CreateQuestionGroupValidationPipe } from './pipes/create-question-group.pipe';

@ApiTags('Exams Endpoints')
@Controller('exams')
export class ExamController {
  constructor(private readonly examService: ExamService) {}

  /********************* */
  /***Exam Routes for Public Users***/
  /********************* */
  @ApiOperation({ summary: 'Get Published Exams with / without filers' })
  @ApiResponse({ status: 200, description: 'Exam Object Array' })
  @Get('/published')
  async getPublishedExams(
    @Query(new ExamFilterValidationPipe()) filterExamDto: FilterExamDto,
  ): Promise<Exam[]> {
    return await this.examService.getPublishedExams(filterExamDto);
  }
  @Get('/published/indexes')
  async getPublishedExamIndexes(): Promise<Partial<Exam>[]> {
    return await this.examService.getPublishedExamIndexes();
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
  @UseInterceptors(FileFieldsInterceptor([]))
  async createExam(
    @Body(new ExamValidationPipe()) createExamDto: CreateExamDto,
    @getUser() user: User,
  ): Promise<Exam[]> {
    return await this.examService.createExam(createExamDto, user);
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
  @UseInterceptors(FileFieldsInterceptor([]))
  async updateExam(
    @Body(new ExamValidationPipe()) updateExamDto: UpdateExamDto,
    @Param('examId', ParseIntPipe) examId: number,
    @getUser() user: User,
  ): Promise<Exam[]> {
    return await this.examService.updateExam(updateExamDto, examId, user);
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
  @ApiOperation({ summary: 'Get all sections of an exam' })
  @Get('/:examId/sections')
  @UseGuards(AuthGuard())
  async getSections(
    @Param('examId', ParseIntPipe) examId: number,
    @getUser() user: User,
  ): Promise<Section[]> {
    return await this.examService.getSections(examId, user);
  }

  @ApiOperation({ summary: 'Create a section of an reading/listening/speaking exam' })
  @Post('/:examId/sections')
  @UseGuards(AuthGuard())
  @UseInterceptors(FileFieldsInterceptor([]))
  async createSection(
    @Body(new ValidationPipe()) createSectionDto: CreateSectionDto,
    @Param('examId', ParseIntPipe) examId: number,
    @getUser() user: User,
  ) {
    return await this.examService.createSection(createSectionDto, examId, user);
  }

  @ApiOperation({ summary: 'Create a section of an writing exam' })
  @Post('/:examId/writingSections')
  @UseGuards(AuthGuard())
  @UseInterceptors(FileFieldsInterceptor([]))
  async createWritingSection(
    @Body(new CreateWritingSectionValidationPipe()) createWritingSectionDto: CreateWritingSectionDto,
    @Param('examId', ParseIntPipe) examId: number,
    @getUser() user: User,
  ): Promise<Section> {
    return await this.examService.createWritingSection(createWritingSectionDto, examId, user);
  }

  @ApiOperation({ summary: 'Get an section with a specific id' })
  @Get('/:examId/sections/:sectionId')
  @UseGuards(AuthGuard())
  async getSection(
    @Param('examId', ParseIntPipe) examId: number,
    @Param('sectionId', ParseIntPipe) sectionId: number,
    @getUser() user: User,
  ): Promise<Section> {
    return await this.examService.getSection(examId, sectionId, user);
  }

  @ApiOperation({ summary: 'Update a section of an reading/listening/speaking exam' })
  @Put('/:examId/sections/:sectionId')
  @UseGuards(AuthGuard())
  @UseInterceptors(FileFieldsInterceptor([]))
  async updateSection(
    @Body(new ValidationPipe()) updateSectionDto: UpdateSectionDto,
    @Param('examId', ParseIntPipe) examId: number,
    @Param('sectionId', ParseIntPipe) sectionId: number,
    @getUser() user: User,
  ): Promise<Section> {
    return await this.examService.updateSection(
      updateSectionDto,
      examId,
      sectionId,
      user,
    );
  }

  @ApiOperation({ summary: 'Update a section of an writing exam' })
  @Put('/:examId/writingSections/:sectionId')
  @UseGuards(AuthGuard())
  @UseInterceptors(FileFieldsInterceptor([]))
  async updateWritingSection(
    @Body(new CreateWritingSectionValidationPipe()) updateWritingSectionDto: UpdateWritingSectionDto,
    @Param('examId', ParseIntPipe) examId: number,
    @Param('sectionId', ParseIntPipe) sectionId: number,
    @getUser() user: User,
  ): Promise<Section> {
    return await this.examService.updateWritingSection(
      updateWritingSectionDto,
      examId,
      sectionId,
      user,
    );
  }

  @ApiOperation({ summary: 'Delete a section of an exam' })
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
  @UseInterceptors(FileFieldsInterceptor([]))
  async createQuestionGroups(
    @Body(new CreateQuestionGroupValidationPipe())
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
  @UseInterceptors(FileFieldsInterceptor([]))
  async updateQuestionGroup(
    @Body(new CreateQuestionGroupValidationPipe())
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
