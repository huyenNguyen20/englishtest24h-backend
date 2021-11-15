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
  Inject,
  Response,
  HttpStatus,
  NotFoundException
} from '@nestjs/common';
import { ExamService } from './exam.service';
import { CreateExamDto, UpdateExamDto, FilterExamDto } from './dto';
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
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';
import { isTeacher } from 'src/auth/decorator/isTeacher.decorator';
import { getExam } from './decorators/getExam.decorator';

@ApiTags('Exams Endpoints')
@Controller('exams')
export class ExamController {
  constructor(
      @Inject(WINSTON_MODULE_PROVIDER) 
      private readonly logger: Logger,

      private readonly examService: ExamService
    ) {}

  /********************* */
  /***Exam Routes for Public Users***/
  /********************* */
  @ApiOperation({ summary: 'Get Exam Indexes for Populating FrontEnd Routes' })
  @ApiResponse({ status: 200, description: 'Exam Object Array' })
  @Get('/indexes')
  async getExamIndexes(
    @Response() res
  ){
    try{
      const exams : Partial<Exam>[] = await this.examService.getExamIndexes();
      return res.status(HttpStatus.OK).json({results: exams});
    } catch (e) {
      this.logger.error(JSON.stringify(e));
      return res
      .status(HttpStatus.INTERNAL_SERVER_ERROR)
      .json({message: "Something went wrong. Please try again!"})
    }
  }

  @ApiOperation({ summary: 'Get Published Exams with / without filters' })
  @ApiResponse({ status: 200, description: 'Exam Object Array' })
  @Get('/published')
  async getPublishedExams(
    @Query(new ExamFilterValidationPipe()) filterExamDto: FilterExamDto,
    @Response() res
  ){
    try{
      const exams : Exam[] = await this.examService.getPublishedExams(filterExamDto);
      return res.status(HttpStatus.OK).json({results: exams});
    } catch (e) {
      this.logger.error(JSON.stringify(e));
      return res
      .status(HttpStatus.INTERNAL_SERVER_ERROR)
      .json({message: "Something went wrong. Please try again!"})
    }
  }

  @ApiOperation({ summary: 'Get Total Published Exams' })
  @ApiResponse({ status: 200, description: 'Number' })
  @Get('/published/total')
  async getPublishedExamsCount(
    @Response() res
  ){
    try{
      const total : number = await this.examService.getPublishedExamsCount();
      return res.status(HttpStatus.OK).json({results: total});
    } catch (e) {
      this.logger.error(JSON.stringify(e));
      return res
      .status(HttpStatus.INTERNAL_SERVER_ERROR)
      .json({message: "Something went wrong. Please try again!"})
    }
  }

  @ApiOperation({ summary: 'Get Published Exam Indexes for Populating FrontEnd Routes' })
  @Get('/published/indexes')
  async getPublishedExamIndexes(
    @Response() res
  ){
    try{
      const exams : Partial<Exam>[] = await this.examService.getPublishedExamIndexes();
      return res.status(HttpStatus.OK).json({results: exams});
    } catch (e) {
      this.logger.error(JSON.stringify(e));
      return res
      .status(HttpStatus.INTERNAL_SERVER_ERROR)
      .json({message: "Something went wrong. Please try again!"})
    }
    
  }

  @ApiOperation({ summary: 'Get Latest Restricted Exams' })
  @Get('/published/latest')
  async getLatestExams(
    @Response() res
  ){
    try{
      const exams : Exam[] = await this.examService.getLatestExams();
      return res.status(HttpStatus.OK).json({results: exams});
    } catch (e) {
      this.logger.error(JSON.stringify(e));
      return res
      .status(HttpStatus.INTERNAL_SERVER_ERROR)
      .json({message: "Something went wrong. Please try again!"})
    }
  }

  @ApiOperation({ summary: 'Get Related Published Exams' })
  @Get('/published/related/:examId')
  async getRelatedExams(
    @Param('examId', ParseIntPipe) examId: number,
    @Response() res
  ){
    try{
      const exams : Exam[] = await this.examService.getRelatedExams(examId);
      return res.status(HttpStatus.OK).json({results: exams});
    } catch (e) {
      this.logger.error(JSON.stringify(e));
      return res
      .status(HttpStatus.INTERNAL_SERVER_ERROR)
      .json({message: "Something went wrong. Please try again!"})
    }
  }

  @ApiOperation({ summary: 'Get Subjects' })
  @Get('/subjects')
  async getSubject(
    @Response() res
  ){
    try{
      const subjects : any = await this.examService.getSubjects();
      return res.status(HttpStatus.OK).json({results: subjects});
    } catch (e) {
      this.logger.error(JSON.stringify(e));
      return res
      .status(HttpStatus.INTERNAL_SERVER_ERROR)
      .json({message: "Something went wrong. Please try again!"})
    }
  }

  @ApiOperation({ summary: 'Get Question Types' })
  @Get('/questionTypes')
  async getQuestionTypes(
    @Response() res
  ){
    try{
      const questionTypes : string[] = await this.examService.getQuestionTypes();
      return res.status(HttpStatus.OK).json({results: questionTypes});
    } catch (e) {
      this.logger.error(JSON.stringify(e));
      return res
      .status(HttpStatus.INTERNAL_SERVER_ERROR)
      .json({message: "Something went wrong. Please try again!"})
    }
  }

  @ApiOperation({ summary: 'Get Details of an Published Exam' })
  @Get('/published/:examId/examDetails')
  async getExamDetails(
    @Param('examId', ParseIntPipe) examId: number,
    @Response() res
  ){
    try{
      const exam : Exam = await this.examService.getPublishedExam(examId);
      return res.status(HttpStatus.OK).json({results: exam});
    } catch (e) {
      this.logger.error(JSON.stringify(e));
      return res
      .status(HttpStatus.INTERNAL_SERVER_ERROR)
      .json({message: "Something went wrong. Please try again!"})
    }
  }

  @ApiOperation({ summary: 'Get an Published Exam for test taker' })
  @Get('/published/:examId')
  @UseGuards(AuthGuard())
  async getExamForTestTaker(
    @Param('examId', ParseIntPipe) examId: number,
    @Response() res
  ){
    try{
      const result : { 
        exam: Exam; 
        sections: Section[] 
      } = await this.examService.getExamForTestTaker(examId);
      return res.status(HttpStatus.OK).json({results: result});
    } catch (e) {
      this.logger.error(JSON.stringify(e));
      return res
      .status(HttpStatus.INTERNAL_SERVER_ERROR)
      .json({message: "Something went wrong. Please try again!"})
    }
  }

  @ApiOperation({ summary: 'Update Rating for a published exam' })
  @Post('/published/:examId/updateRating')
  @UseGuards(AuthGuard())
  async updateExamRating(
    @Param('examId', ParseIntPipe) examId: number,
    @Body(new ValidationPipe()) updateRatingDto: UpdateRatingDto,
    @Response() res
  ){
    try{
      await this.examService.updateExamRating(
        updateRatingDto.rating,
        examId,
      );
      return res
      .status(HttpStatus.OK)
      .json({message: "Your rating has been saved successfully"})
    } catch (e) {
      this.logger.error(JSON.stringify(e));
      return res
      .status(HttpStatus.INTERNAL_SERVER_ERROR)
      .json({message: "Something went wrong. Please try again!"})
    }
  }
  /*****************Methods for Restricted Access*************** */
  @ApiOperation({ summary: 'Get Restricted Exams for a Specific User' })
  @Get('/restricted')
  @UseGuards(AuthGuard())
  async getRestrictedExams(
    @getUser() user: User,
    @Query(new ExamFilterValidationPipe()) filterExamDto: FilterExamDto,
    @Response() res
  ){
    try{
      const exams : Exam[] =  await this.examService.getRestrictedExams(user, filterExamDto);
      return res.status(HttpStatus.OK).json({results: exams});
    } catch (e) {
      this.logger.error(JSON.stringify(e));
      return res
      .status(HttpStatus.INTERNAL_SERVER_ERROR)
      .json({message: "Something went wrong. Please try again!"})
    }
  }

  @ApiOperation({ summary: 'Get Total Restricted Exams' })
  @ApiResponse({ status: 200, description: 'Number' })
  @Get('/restricted/total')
  @UseGuards(AuthGuard())
  async getRestrictedExamsCount(
    @getUser() user: User,
    @Response() res
    ){
    try{
      const total : number = await this.examService.getRestrictedExamsCount(user);
      return res.status(HttpStatus.OK).json({results: total});
    } catch (e) {
      this.logger.error(JSON.stringify(e));
      return res
      .status(HttpStatus.INTERNAL_SERVER_ERROR)
      .json({message: "Something went wrong. Please try again!"})
    }
  }

  @ApiOperation({ summary: 'Get Indexes of Restricted Exams' })
  @Get('/restricted/indexes')
  async getRestrictedExamIndexes(
    @Response() res
  ){
    try{
      const exams : Partial<Exam>[] = await this.examService.getRestrictedExamIndexes();
      return res.status(HttpStatus.OK).json({results: exams});
    } catch (e) {
      this.logger.error(JSON.stringify(e));
      return res
      .status(HttpStatus.INTERNAL_SERVER_ERROR)
      .json({message: "Something went wrong. Please try again!"})
    }
  }

  @ApiOperation({ summary: 'Get Details of an Restricted Exam' })
  @Get('/restricted/:examId/examDetails')
  @UseGuards(AuthGuard())
  async getRestrictedExamDetails(
    @Param('examId', ParseIntPipe) examId: number,
    @getUser() user: User,
    @Response() res
  ){
    try{
      const exam : Exam = await this.examService.getRestrictedExam(user, examId);
      return res.status(HttpStatus.OK).json({results: exam});
    } catch (e) {
      this.logger.error(JSON.stringify(e));
      return res
      .status(HttpStatus.INTERNAL_SERVER_ERROR)
      .json({message: "Something went wrong. Please try again!"})
    }
  }

  @ApiOperation({ summary: 'Get an Published Exam for test takers' })
  @Get('/restricted/:examId')
  @UseGuards(AuthGuard())
  async getRestrictedExamForTestTaker(
    @Param('examId', ParseIntPipe) examId: number,
    @getUser() user: User,
    @Response() res
  ){
    try{
      const result : { 
        exam: Exam; 
        sections: Section[] 
      } = await this.examService.getRestrictedExamForTestTaker(user, examId);
      return res.status(HttpStatus.OK).json({results: result});
    } catch (e) {
      this.logger.error(JSON.stringify(e));
      return res
      .status(HttpStatus.INTERNAL_SERVER_ERROR)
      .json({message: "Something went wrong. Please try again!"})
    }
  }

  @ApiOperation({ summary: 'Update rating for an Published Exam' })
  @Post('/restricted/:examId/updateRating')
  @UseGuards(AuthGuard())
  async updateRestrictedExamRating(
    @Param('examId', ParseIntPipe) examId: number,
    @getUser() user: User,
    @Body(new ValidationPipe()) updateRatingDto: UpdateRatingDto,
    @Response() res
  ){
    try{
      await this.examService.updateExamRating(
        updateRatingDto.rating,
        examId,
      );
      return res.status(HttpStatus.OK).json({message: "Your rating has been submitted successfully"});
    } catch (e) {
      this.logger.error(JSON.stringify(e));
      return res
      .status(HttpStatus.INTERNAL_SERVER_ERROR)
      .json({message: "Something went wrong. Please try again!"})
    }
  }

  /****************************************** */
  /***Exam Routes for Educators / Exam Owner***/
  /****************************************** */
  @ApiOperation({ summary: 'Method for EXAM OWNER to get their exams' })
  @Get()
  @UseGuards(AuthGuard())
  async getExams(
    @getUser() user: User,
    @isTeacher() isTeacher: boolean,
    @Response() res
    ){
    try {
      if(!isTeacher) 
        return res.status(HttpStatus.FORBIDDEN).json({message: 'You are forbidden'});
      const exams : Exam[] = await this.examService.getExams(user);
      return res.status(HttpStatus.OK).json({results: exams});
    } catch (e){
      this.logger.error(JSON.stringify(e));
      return res
      .status(HttpStatus.INTERNAL_SERVER_ERROR)
      .json({message: 'Something went wrong. Please try again!'})
    }
  }

  @ApiOperation({ summary: 'Method for EXAM OWNER to create exam' })
  @Post()
  @UseGuards(AuthGuard())
  @UseInterceptors(FileFieldsInterceptor([]))
  async createExam(
    @Body(new ExamValidationPipe()) createExamDto: CreateExamDto,
    @getUser() user: User,
    @isTeacher() isTeacher: boolean,
    @Response() res
  ){
    try {
      if(!isTeacher) 
        return res.status(HttpStatus.FORBIDDEN).json({message: 'You are forbidden'})
      const exams : Exam[] = await this.examService.createExam(createExamDto, user);
      return res.status(HttpStatus.OK).json({results: exams});
    } catch (e){
      this.logger.error(JSON.stringify(e));
      return res
      .status(HttpStatus.INTERNAL_SERVER_ERROR)
      .json({message: 'Something went wrong. Please try again!'})
    }
  }

  @ApiOperation({ summary: 'Method for EXAM OWNER to get exam' })
  @Get('/:examId')
  @UseGuards(AuthGuard())
  async getExam(
    @Param('examId', ParseIntPipe) examId: number,
    @getUser() user: User,
    @isTeacher() isTeacher: boolean,
    @getExam() exam: Exam,
    @Response() res
  ){
    try {
      if(!isTeacher || exam.ownerId !== user.id) 
        return res.status(HttpStatus.FORBIDDEN).json({message: 'You are forbidden'})
      const examResult : Exam = await this.examService.getExam(examId, user);
      return res.status(HttpStatus.OK).json({results: examResult});
    } catch (e){
      this.logger.error(JSON.stringify(e));
      return res
      .status(HttpStatus.INTERNAL_SERVER_ERROR)
      .json({message: 'Something went wrong. Please try again!'})
    }
  }

  @ApiOperation({ summary: 'Method for EXAM OWNER to update exam' })
  @Put('/:examId')
  @UseGuards(AuthGuard())
  @UseInterceptors(FileFieldsInterceptor([]))
  async updateExam(
    @Body(new ExamValidationPipe()) updateExamDto: UpdateExamDto,
    @Param('examId', ParseIntPipe) examId: number,
    @getUser() user: User,
    @getExam() exam: Exam,
    @isTeacher() isTeacher: boolean,
    @Response() res
  ){
    try {
      if(!exam) throw new NotFoundException("Exam Not Found");
      if(!isTeacher || exam.ownerId !== user.id) 
        return res.status(HttpStatus.FORBIDDEN).json({message: 'You are forbidden'})
      const exams : Exam[] = await this.examService.updateExam(updateExamDto, examId, user);
      return res.status(HttpStatus.OK).json({results: exams});
    } catch (e){
      this.logger.error(JSON.stringify(e));
      return res
      .status(HttpStatus.INTERNAL_SERVER_ERROR)
      .json({message: 'Something went wrong. Please try again!'})
    }
  }

  @ApiOperation({ summary: 'Method for EXAM OWNER to update `isPublished` attribute of an exam' })
  @Put('/:examId/published')
  @UseGuards(AuthGuard())
  async togglePublishExam(
    @Param('examId', ParseIntPipe) examId: number,
    @getUser() user: User,
    @getExam() exam: Exam,
    @isTeacher() isTeacher: boolean,
    @Response() res
  ){
    try {
      if(!exam) throw new NotFoundException("Exam Not Found");
      if(!isTeacher || exam.ownerId !== user.id) 
        return res.status(HttpStatus.FORBIDDEN).json({message: 'You are forbidden'})
      const exams : Exam[] = await this.examService.togglePublishExam(examId, user);
      return res.status(HttpStatus.OK).json({results: exams});
    } catch (e){
      this.logger.error(JSON.stringify(e));
      return res
      .status(HttpStatus.INTERNAL_SERVER_ERROR)
      .json({message: 'Something went wrong. Please try again!'})
    }
  }

  @ApiOperation({ summary: 'Method for EXAM OWNER to update `restrictedAccessList` of an exam' })
  @Put('/:examId/restrictedList')
  @UseGuards(AuthGuard())
  async postRestrictedAccessList(
    @Body(new ValidationPipe()) body: { restrictedList: string },
    @Param('examId', ParseIntPipe) examId: number,
    @getUser() user: User,
    @getExam() exam: Exam,
    @isTeacher() isTeacher: boolean,
    @Response() res
  ){
    try {
      if(!exam) throw new NotFoundException("Exam Not Found");
      if(!isTeacher || exam.ownerId !== user.id) 
        return res.status(HttpStatus.FORBIDDEN).json({message: 'You are forbidden'})
      const exams : Exam[] = await this.examService.postRestrictedAccessList(
          body.restrictedList,
          examId,
          user,
        );
      return res.status(HttpStatus.OK).json({results: exams});
    } catch (e){
      this.logger.error(JSON.stringify(e));
      return res
      .status(HttpStatus.INTERNAL_SERVER_ERROR)
      .json({message: 'Something went wrong. Please try again!'})
    }
  }

  @ApiOperation({ summary: 'Method for EXAM OWNER to delete an exam' })
  @Delete('/:examId')
  @UseGuards(AuthGuard())
  async removeExam(
    @Param('examId', ParseIntPipe) examId: number,
    @getUser() user: User,
    @getExam() exam: Exam,
    @isTeacher() isTeacher: boolean,
    @Response() res
  ){
    try {
      if(!exam) throw new NotFoundException("Exam Not Found");
      if(!isTeacher || exam.ownerId !== user.id) 
        return res.status(HttpStatus.FORBIDDEN).json({message: 'You are forbidden'})
      const exams : Exam[] = await this.examService.removeExam(examId, user);
      return res.status(HttpStatus.OK).json({results: exams});
    } catch (e){
      this.logger.error(JSON.stringify(e));
      return res
      .status(HttpStatus.INTERNAL_SERVER_ERROR)
      .json({message: 'Something went wrong. Please try again!'})
    }
  }

  /********************* */
  /***Sections***/
  /********************* */
  @ApiOperation({ summary: 'Method for EXAM OWNER to get all sections of an exam' })
  @Get('/:examId/sections')
  @UseGuards(AuthGuard())
  async getSections(
    @Param('examId', ParseIntPipe) examId: number,
    @getUser() user: User,
    @getExam() exam: Exam,
    @isTeacher() isTeacher: boolean,
    @Response() res
  ){
    try {
      if(!exam) throw new NotFoundException("Exam Not Found");
      if(!isTeacher || exam.ownerId !== user.id) 
        return res.status(HttpStatus.FORBIDDEN).json({message: 'You are forbidden'})
      const sections : Section[] = await this.examService.getSections(examId, user);
      return res.status(HttpStatus.OK).json({results: sections});
    } catch (e){
      this.logger.error(JSON.stringify(e));
      return res
      .status(HttpStatus.INTERNAL_SERVER_ERROR)
      .json({message: 'Something went wrong. Please try again!'})
    }
  }

  @ApiOperation({
    summary: 'Method for EXAM OWNER to Create a section of an reading/listening/speaking exam',
  })
  @Post('/:examId/sections')
  @UseGuards(AuthGuard())
  @UseInterceptors(FileFieldsInterceptor([]))
  async createSection(
    @Body(new ValidationPipe()) createSectionDto: CreateSectionDto,
    @Param('examId', ParseIntPipe) examId: number,
    @getUser() user: User,
    @getExam() exam: Exam,
    @isTeacher() isTeacher: boolean,
    @Response() res
  ){
    try {
      if(!exam) throw new NotFoundException("Exam Not Found");
      if(!isTeacher || exam.ownerId !== user.id) 
        return res.status(HttpStatus.FORBIDDEN).json({message: 'You are forbidden'})
      const section : Section = await this.examService.createSection(createSectionDto, examId, user);
      return res.status(HttpStatus.OK).json({results: section});
    } catch (e){
      this.logger.error(JSON.stringify(e));
      return res
      .status(HttpStatus.INTERNAL_SERVER_ERROR)
      .json({message: 'Something went wrong. Please try again!'})
    }
  }

  @ApiOperation({ summary: 'Method for EXAM OWNER to Create a section of an writing exam' })
  @Post('/:examId/writingSections')
  @UseGuards(AuthGuard())
  @UseInterceptors(FileFieldsInterceptor([]))
  async createWritingSection(
    @Body(new CreateWritingSectionValidationPipe())
    createWritingSectionDto: CreateWritingSectionDto,
    @Param('examId', ParseIntPipe) examId: number,
    @getUser() user: User,
    @getExam() exam: Exam,
    @isTeacher() isTeacher: boolean,
    @Response() res
  ){
    try {
      if(!exam) throw new NotFoundException("Exam Not Found");
      if(!isTeacher || exam.ownerId !== user.id) 
        return res.status(HttpStatus.FORBIDDEN).json({message: 'You are forbidden'})
      const section : Section = await this.examService.createWritingSection(
          createWritingSectionDto,
          examId,
          user,
        );
      return res.status(HttpStatus.OK).json({results: section});
    } catch (e){
      this.logger.error(JSON.stringify(e));
      return res
      .status(HttpStatus.INTERNAL_SERVER_ERROR)
      .json({message: 'Something went wrong. Please try again!'})
    }
  }

  @ApiOperation({ summary: 'Method for EXAM OWNER to Get an section with a specific id' })
  @Get('/:examId/sections/:sectionId')
  @UseGuards(AuthGuard())
  async getSection(
    @Param('examId', ParseIntPipe) examId: number,
    @Param('sectionId', ParseIntPipe) sectionId: number,
    @getUser() user: User,
    @getExam() exam: Exam,
    @isTeacher() isTeacher: boolean,
    @Response() res
  ){
    try {
      if(!exam) throw new NotFoundException("Exam Not Found");
      if(!isTeacher || exam.ownerId !== user.id) 
        return res.status(HttpStatus.FORBIDDEN).json({message: 'You are forbidden'})
      const section : Section = await this.examService.getSection(examId, sectionId, user);
      return res.status(HttpStatus.OK).json({results: section});
    } catch (e){
      this.logger.error(JSON.stringify(e));
      return res
      .status(HttpStatus.INTERNAL_SERVER_ERROR)
      .json({message: 'Something went wrong. Please try again!'})
    }
  }

  @ApiOperation({
    summary: ' Method for EXAM OWNER to Update a section of an reading/listening/speaking exam',
  })
  @Put('/:examId/sections/:sectionId')
  @UseGuards(AuthGuard())
  @UseInterceptors(FileFieldsInterceptor([]))
  async updateSection(
    @Body(new ValidationPipe()) updateSectionDto: UpdateSectionDto,
    @Param('examId', ParseIntPipe) examId: number,
    @Param('sectionId', ParseIntPipe) sectionId: number,
    @getUser() user: User,
    @getExam() exam: Exam,
    @isTeacher() isTeacher: boolean,
    @Response() res
  ){
    try {
      if(!exam) throw new NotFoundException("Exam Not Found");
      if(!isTeacher || exam.ownerId !== user.id) 
        return res.status(HttpStatus.FORBIDDEN).json({message: 'You are forbidden'})
      const section : Section = await this.examService.updateSection(
          updateSectionDto,
          examId,
          sectionId,
          user,
        );
      return res.status(HttpStatus.OK).json({results: section});
    } catch (e){
      this.logger.error(JSON.stringify(e));
      return res
      .status(HttpStatus.INTERNAL_SERVER_ERROR)
      .json({message: 'Something went wrong. Please try again!'})
    }
  }

  @ApiOperation({ summary: 'Method for EXAM OWNER to Update a section of an writing exam' })
  @Put('/:examId/writingSections/:sectionId')
  @UseGuards(AuthGuard())
  @UseInterceptors(FileFieldsInterceptor([]))
  async updateWritingSection(
    @Body(new CreateWritingSectionValidationPipe())
    updateWritingSectionDto: UpdateWritingSectionDto,
    @Param('examId', ParseIntPipe) examId: number,
    @Param('sectionId', ParseIntPipe) sectionId: number,
    @getUser() user: User,
    @getExam() exam: Exam,
    @isTeacher() isTeacher: boolean,
    @Response() res
  ){
    try {
      if(!exam) throw new NotFoundException("Exam Not Found");
      if(!isTeacher || exam.ownerId !== user.id) 
        return res.status(HttpStatus.FORBIDDEN).json({message: 'You are forbidden'})
      const section : Section = await this.examService.updateWritingSection(
          updateWritingSectionDto,
          examId,
          sectionId,
          user,
        );
      return res.status(HttpStatus.OK).json({results: section});
    } catch (e){
      this.logger.error(JSON.stringify(e));
      return res
      .status(HttpStatus.INTERNAL_SERVER_ERROR)
      .json({message: 'Something went wrong. Please try again!'})
    }
  }

  @ApiOperation({ summary: 'Method for EXAM OWNER to Delete a section of an exam' })
  @Delete('/:examId/sections/:sectionId')
  @UseGuards(AuthGuard())
  async removeSection(
    @Param('examId', ParseIntPipe) examId: number,
    @Param('sectionId', ParseIntPipe) sectionId: number,
    @getUser() user: User,
    @getExam() exam: Exam,
    @isTeacher() isTeacher: boolean,
    @Response() res
  ){
    try {
      if(!exam) throw new NotFoundException("Exam Not Found");
      if(!isTeacher || exam.ownerId !== user.id) 
        return res.status(HttpStatus.FORBIDDEN).json({message: 'You are forbidden'})
      const sections : Section[] = await this.examService.removeSection(examId, sectionId, user);
      return res.status(HttpStatus.OK).json({results: sections});
    } catch (e){
      this.logger.error(JSON.stringify(e));
      return res
      .status(HttpStatus.INTERNAL_SERVER_ERROR)
      .json({message: 'Something went wrong. Please try again!'})
    }
  }

  /********************* */
  /***Question Groups***/
  /********************* */
  @ApiOperation({ summary: 'Method for EXAM OWNER to get all question groups of a section of an exam' })
  @Get('/:examId/sections/:sectionId/questionGroups')
  @UseGuards(AuthGuard())
  async getQuestionGroups(
    @Param('examId', ParseIntPipe) examId: number,
    @Param('sectionId', ParseIntPipe) sectionId: number,
    @getUser() user: User,
    @getExam() exam: Exam,
    @isTeacher() isTeacher: boolean,
    @Response() res
  ){
    try {
      if(!exam) throw new NotFoundException("Exam Not Found");
      if(!isTeacher || exam.ownerId !== user.id) 
        return res.status(HttpStatus.FORBIDDEN).json({message: 'You are forbidden'})
      const questionGroups : QuestionGroup[] = await this.examService.getQuestionGroups(sectionId, user);
      return res.status(HttpStatus.OK).json({results: questionGroups});
    } catch (e){
      this.logger.error(JSON.stringify(e));
      return res
      .status(HttpStatus.INTERNAL_SERVER_ERROR)
      .json({message: 'Something went wrong. Please try again!'})
    }
  }

  @ApiOperation({ summary: 'Method for EXAM OWNER to create question groups of a section of an exam' })
  @Post('/:examId/sections/:sectionId/questionGroups')
  @UseGuards(AuthGuard())
  @UseInterceptors(FileFieldsInterceptor([]))
  async createQuestionGroups(
    @Body(new CreateQuestionGroupValidationPipe())
    createQuestionGroupDto: CreateQuestionGroupDto,
    @Param('examId', ParseIntPipe) examId: number,
    @Param('sectionId', ParseIntPipe) sectionId: number,
    @getUser() user: User,
    @getExam() exam: Exam,
    @isTeacher() isTeacher: boolean,
    @Response() res
  ){
    try {
      if(!exam) throw new NotFoundException("Exam Not Found");
      if(!isTeacher || exam.ownerId !== user.id) 
        return res.status(HttpStatus.FORBIDDEN).json({message: 'You are forbidden'})
      const questionGroups : QuestionGroup[] = await this.examService.createQuestionGroup(
          createQuestionGroupDto,
          examId,
          sectionId,
          user,
        );
      return res.status(HttpStatus.OK).json({results: questionGroups});
    } catch (e){
      this.logger.error(JSON.stringify(e));
      return res
      .status(HttpStatus.INTERNAL_SERVER_ERROR)
      .json({message: 'Something went wrong. Please try again!'})
    }
  }

  @ApiOperation({ summary: 'Method for EXAM OWNER to update  question groups of a section of an exam' })
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
    @getExam() exam: Exam,
    @isTeacher() isTeacher: boolean,
    @Response() res
  ){
    try {
      if(!exam) throw new NotFoundException("Exam Not Found");
      if(!isTeacher || exam.ownerId !== user.id) 
        return res.status(HttpStatus.FORBIDDEN).json({message: 'You are forbidden'})
      const questionGroups : QuestionGroup[] = await this.examService.updateQuestionGroup(
          updateQuestionGroupDto,
          sectionId,
          questionGroupId,
          user,
        );
      return res.status(HttpStatus.OK).json({results: questionGroups});
    } catch (e){
      this.logger.error(JSON.stringify(e));
      return res
      .status(HttpStatus.INTERNAL_SERVER_ERROR)
      .json({message: 'Something went wrong. Please try again!'})
    }
  }

  @ApiOperation({ summary: 'Method for EXAM OWNER to delete a question group of a section of an exam' })
  @Delete('/:examId/sections/:sectionId/questionGroups/:questionGroupId')
  @UseGuards(AuthGuard())
  async removeQuestionGroup(
    @Param('examId', ParseIntPipe) examId: number,
    @Param('sectionId', ParseIntPipe) sectionId: number,
    @Param('questionGroupId', ParseIntPipe) questionGroupId: number,
    @getUser() user: User,
    @getExam() exam: Exam,
    @isTeacher() isTeacher: boolean,
    @Response() res
  ){
    try {
      if(!exam) throw new NotFoundException("Exam Not Found");
      if(!isTeacher || exam.ownerId !== user.id) 
        return res.status(HttpStatus.FORBIDDEN).json({message: 'You are forbidden'})
      const questionGroups : QuestionGroup[] = await this.examService.removeQuestionGroup(
          sectionId,
          questionGroupId,
          user,
        );
      return res.status(HttpStatus.OK).json({results: questionGroups});
    } catch (e){
      this.logger.error(JSON.stringify(e));
      return res
      .status(HttpStatus.INTERNAL_SERVER_ERROR)
      .json({message: 'Something went wrong. Please try again!'})
    }
  }
}
