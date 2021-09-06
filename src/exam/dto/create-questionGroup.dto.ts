import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { CreateQuestionDto } from './create-question.dto';

export class CreateQuestionGroupDto {
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  type: number;

  @IsOptional()
  @IsString()
  htmlContent: string;

  @IsNotEmpty()
  @IsString()
  title: string;

  @IsOptional()
  questions: CreateQuestionDto[];
}
