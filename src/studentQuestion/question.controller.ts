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
} from '@nestjs/common';
import { CreateQuestionDto } from './dto/create-question.dto';
import { UpdateQuestionDto } from './dto/update-question.dto';
import { AuthGuard } from '@nestjs/passport';
import { getUser } from 'src/auth/decorator/getUser.decorator';
import { User } from 'src/auth/entities/user.entity';
import { StudentQuestionService } from './question.service';
import { StudentQuestion } from './entities/question.entity';
import { CreateTeacherAnswerDto } from './dto/create-answer.dto';

@Controller('studentQuestion')
export class StudentQuestionController {
  constructor(
    private readonly studentQuestionService: StudentQuestionService,
  ) {}
  /*******Post Routes*********/
  // Route for STUDENT to create their questions
  @Post('/student/:examId')
  @UseGuards(AuthGuard())
  async createQuestion(
    @Body(new ValidationPipe()) createQuestionDto: CreateQuestionDto,
    @Param('examId', ParseIntPipe) examId: number,
    @getUser() user: User,
  ): Promise<StudentQuestion[]> {
    return await this.studentQuestionService.createQuestion(
      createQuestionDto,
      examId,
      user,
    );
  }

  /*****GET****** */
  //Route for STUDENTS to get their questions for one exam
  @Get('/student/:examId')
  @UseGuards(AuthGuard())
  async getQuestionsForStudent(
    @Param('examId', ParseIntPipe) examId: number,
    @getUser() user: User,
  ): Promise<StudentQuestion[]> {
    return await this.studentQuestionService.getQuestionsForStudent(
      examId,
      user,
    );
  }

  //Route for TEACHER to get all students' questions for one exam
  @Get('/teacher/:examId')
  @UseGuards(AuthGuard())
  async getQuestionsForTeacher(
    @Param('examId', ParseIntPipe) examId: number,
    @getUser() user: User,
  ): Promise<StudentQuestion[]> {
    return await this.studentQuestionService.getQuestionsForTeacher(
      examId,
      user,
    );
  }

  /*****UPDATE****** */
  //Method for STUDENT to edit their question
  @Put('/student/:examId/:questionId')
  @UseGuards(AuthGuard())
  async updateQuestion(
    @Body() updateQuestionDto: UpdateQuestionDto,
    @Param('examId', ParseIntPipe) examId: number,
    @Param('questionId', ParseIntPipe) questionId: number,
    @getUser() user: User,
  ): Promise<StudentQuestion[]> {
    return await this.studentQuestionService.updateQuestion(
      updateQuestionDto,
      examId,
      questionId,
      user,
    );
  }

  //Method for TEACHER to post/edit their answers to students' question
  @Put('/teacher/:examId/:questionId')
  @UseGuards(AuthGuard())
  async updateAnswer(
    @Body() createAnswerDto: CreateTeacherAnswerDto,
    @Param('examId', ParseIntPipe) examId: number,
    @Param('questionId', ParseIntPipe) questionId: number,
    @getUser() user: User,
  ): Promise<StudentQuestion[]> {
    return await this.studentQuestionService.updateAnswer(
      createAnswerDto,
      examId,
      questionId,
      user,
    );
  }

  /*****DELETE****** */
  //Method for STUDENT to delete their questions
  @Delete('/student/:examId/:questionId')
  @UseGuards(AuthGuard())
  async deleteQuestionForStudent(
    @Param('examId', ParseIntPipe) examId: number,
    @Param('questionId', ParseIntPipe) questionId: number,
    @getUser() user: User,
  ): Promise<StudentQuestion[]> {
    return await this.studentQuestionService.deleteQuestionForStudent(
      questionId,
      examId,
      user,
    );
  }

  @Delete('/teacher/:examId')
  @UseGuards(AuthGuard())
  async deleteQuestionsForTeacher(
    @Param('examId', ParseIntPipe) examId: number,
    @Query('idList') idList: string,
    @getUser() user: User,
  ): Promise<StudentQuestion[]> {
    const list: string[] = idList.split(' ');
    return await this.studentQuestionService.deleteQuestionsForTeacher(
      list,
      examId,
      user,
    );
  }
}
