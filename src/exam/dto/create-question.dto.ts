import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { CreateAnswerDto } from './create-answer.dto';

export class CreateQuestionDto {
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  score: number;

  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  order: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  minWords: number;

  @IsOptional()
  @IsString()
  question: string;

  @IsOptional()
  @IsString()
  positionId: string;

  @IsOptional()
  @IsString()
  htmlExplaination: string;

  @IsOptional()
  answers: CreateAnswerDto[];
}
