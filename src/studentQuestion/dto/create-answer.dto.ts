import { IsNotEmpty, IsString } from 'class-validator';

export class CreateTeacherAnswerDto {
  @IsNotEmpty()
  @IsString()
  answer: string;
}
