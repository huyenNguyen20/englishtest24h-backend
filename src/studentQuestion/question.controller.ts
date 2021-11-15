import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
  Put,
  ParseIntPipe,
  ValidationPipe,
  Query,
  Inject,
  Response,
  HttpStatus,
} from '@nestjs/common';
import { Logger } from 'winston';
import { CreateQuestionDto } from './dto/create-question.dto';
import { UpdateQuestionDto } from './dto/update-question.dto';
import { AuthGuard } from '@nestjs/passport';
import { getUser } from 'src/auth/decorator/getUser.decorator';
import { User } from 'src/auth/entities/user.entity';
import { StudentQuestionService } from './question.service';
import { StudentQuestion } from './entities/question.entity';
import { CreateTeacherAnswerDto } from './dto/create-answer.dto';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { getExam } from 'src/exam/decorators/getExam.decorator';
import { Exam } from 'src/exam/entities/exam.entity';
import { isTeacher } from 'src/auth/decorator/isTeacher.decorator';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('Student Question Endpoints')
@Controller('studentQuestion')
export class StudentQuestionController {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) 
    private readonly logger: Logger,

    private readonly studentQuestionService: StudentQuestionService,
  ) {}
  /*******Post Routes*********/
  // Route for STUDENT to create their questions
  @ApiOperation({
    summary: 'Method for STUDENT to create their questions',
  })
  @Post('/student/:examId')
  @UseGuards(AuthGuard())
  async createQuestion(
    @Body(new ValidationPipe()) createQuestionDto: CreateQuestionDto,
    @Param('examId', ParseIntPipe) examId: number,
    @getUser() user: User,
    @getExam() exam: Exam,
    @Response() res
  ): Promise<StudentQuestion[]> {
    try {
      if(!exam) return res.status(HttpStatus.NOT_FOUND).json({message: "Exam Not Found"});
      const studentQuestion : StudentQuestion[] = 
        await this.studentQuestionService.createQuestion(
          createQuestionDto,
          examId,
          user,
        );
      return studentQuestion;
    } catch (e) {
      this.logger.error(JSON.stringify(e));
      return res
      .status(HttpStatus.INTERNAL_SERVER_ERROR)
      .json({message: "Something went wrong. Please try again!"})
    }
  }

  /*****GET****** */
  //Route for STUDENTS to get their questions for one exam
  @ApiOperation({
    summary: 'Methods for STUDENTS to get their questions for one exam',
  })
  @Get('/student/:examId')
  @UseGuards(AuthGuard())
  async getQuestionsForStudent(
    @Param('examId', ParseIntPipe) examId: number,
    @getUser() user: User,
    @getExam() exam: Exam,
    @Response() res
  ): Promise<StudentQuestion[]> {
    try {
      if(!exam) return res.status(HttpStatus.NOT_FOUND).json({message: "Exam Not Found"});
      const studentQuestions : StudentQuestion[] = 
        await this.studentQuestionService.getQuestionsForStudent(
          examId,
          user,
        );
      return studentQuestions;
    } catch (e) {
      this.logger.error(JSON.stringify(e));
      return res
      .status(HttpStatus.INTERNAL_SERVER_ERROR)
      .json({message: "Something went wrong. Please try again!"})
    }
  }

  //Route for TEACHER to get all students' questions for one exam
  @ApiOperation({
    summary: "Methods for TEACHER to get all students' questions for one exam",
  })
  @Get('/teacher/:examId')
  @UseGuards(AuthGuard())
  async getQuestionsForTeacher(
    @Param('examId', ParseIntPipe) examId: number,
    @getUser() user: User,
    @getExam() exam: Exam,
    @isTeacher() isTeacher: boolean,
    @Response() res
  ): Promise<StudentQuestion[]> {
    try {
      if(!exam) return res.status(HttpStatus.NOT_FOUND).json({message: "Exam Not Found"});
      if(!isTeacher || exam.ownerId !== user.id) 
        return res.status(HttpStatus.FORBIDDEN).json({message: 'You are forbidden'});
      const studentQuestions : StudentQuestion[] =  
        await this.studentQuestionService.getQuestionsForTeacher(
          examId,
          user,
        );
      return studentQuestions;
    } catch (e) {
      this.logger.error(JSON.stringify(e));
      return res
      .status(HttpStatus.INTERNAL_SERVER_ERROR)
      .json({message: "Something went wrong. Please try again!"})
    }
  }

  /*****UPDATE****** */
  //Method for STUDENT to edit their question
  @ApiOperation({
    summary: "Method for STUDENT to edit their question",
  })
  @Put('/student/:examId/:questionId')
  @UseGuards(AuthGuard())
  async updateQuestion(
    @Body() updateQuestionDto: UpdateQuestionDto,
    @Param('examId', ParseIntPipe) examId: number,
    @Param('questionId', ParseIntPipe) questionId: number,
    @getUser() user: User,
    @getExam() exam: Exam,
    @Response() res
  ): Promise<StudentQuestion[]> {
    try {
      if(!exam) return res.status(HttpStatus.NOT_FOUND).json({message: "Exam Not Found"});
      return await this.studentQuestionService.updateQuestion(
        updateQuestionDto,
        examId,
        questionId,
        user,
      );
    } catch (e) {
      this.logger.error(JSON.stringify(e));
      return res
      .status(HttpStatus.INTERNAL_SERVER_ERROR)
      .json({message: "Something went wrong. Please try again!"})
    }
  }

  //Method for TEACHER to post/edit their answers to students' question
  @ApiOperation({
    summary: "Method for TEACHER to post/edit their answers to students' question",
  })
  @Put('/teacher/:examId/:questionId')
  @UseGuards(AuthGuard())
  async updateAnswer(
    @Body() createAnswerDto: CreateTeacherAnswerDto,
    @Param('examId', ParseIntPipe) examId: number,
    @Param('questionId', ParseIntPipe) questionId: number,
    @getUser() user: User,
    @getExam() exam: Exam,
    @isTeacher() isTeacher: boolean,
    @Response() res
  ): Promise<StudentQuestion[]> {
    try {
      if(!exam) return res.status(HttpStatus.NOT_FOUND).json({message: "Exam Not Found"});
      if(!isTeacher || exam.ownerId !== user.id) 
        return res.status(HttpStatus.FORBIDDEN).json({message: 'You are forbidden'});
      const studentQuestions : StudentQuestion[] = 
        await this.studentQuestionService.updateAnswer(
          createAnswerDto,
          examId,
          questionId,
          user,
        );
      return studentQuestions;
    } catch (e) {
      this.logger.error(JSON.stringify(e));
      return res
      .status(HttpStatus.INTERNAL_SERVER_ERROR)
      .json({message: "Something went wrong. Please try again!"})
    }
  }

  /*****DELETE****** */
  //Method for STUDENT to delete their questions
  @ApiOperation({
    summary: "Method for STUDENT to delete their questions",
  })
  @Delete('/student/:examId/:questionId')
  @UseGuards(AuthGuard())
  async deleteQuestionForStudent(
    @Param('examId', ParseIntPipe) examId: number,
    @Param('questionId', ParseIntPipe) questionId: number,
    @getUser() user: User,
    @getExam() exam: Exam,
    @Response() res
  ): Promise<StudentQuestion[]> {
    try {
      if(!exam) return res.status(HttpStatus.NOT_FOUND).json({message: "Exam Not Found"});
      const studentQuestions : StudentQuestion[] = 
        await this.studentQuestionService.deleteQuestionForStudent(
          questionId,
          examId,
          user,
        );
      return studentQuestions;
    } catch (e) {
      this.logger.error(JSON.stringify(e));
      return res
      .status(HttpStatus.INTERNAL_SERVER_ERROR)
      .json({message: "Something went wrong. Please try again!"})
    }
  }

  // Route for TEACHER to delete exam
  @ApiOperation({
    summary: "Method for TEACHER to delete questions of one exam",
  })
  @Delete('/teacher/:examId')
  @UseGuards(AuthGuard())
  async deleteQuestionsForTeacher(
    @Param('examId', ParseIntPipe) examId: number,
    @Query('idList') idList: string,
    @getUser() user: User,
    @getExam() exam: Exam,
    @isTeacher() isTeacher: boolean,
    @Response() res
  ): Promise<StudentQuestion[]> {
    try {
      if(!exam) return res.status(HttpStatus.NOT_FOUND).json({message: "Exam Not Found"});
      if(!isTeacher || exam.ownerId !== user.id) 
        return res.status(HttpStatus.FORBIDDEN).json({message: 'You are forbidden'});
      const list: string[] = idList.split(' ');
      const studentQuestions : StudentQuestion[] = 
        await this.studentQuestionService.deleteQuestionsForTeacher(
          list,
          examId,
          user,
        );
      return studentQuestions;
    } catch (e) {
      this.logger.error(JSON.stringify(e));
      return res
      .status(HttpStatus.INTERNAL_SERVER_ERROR)
      .json({message: "Something went wrong. Please try again!"})
    }
  }
}
