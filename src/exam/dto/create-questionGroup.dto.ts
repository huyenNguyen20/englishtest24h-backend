import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { CreateQuestionDto } from './create-question.dto';

export class CreateQuestionGroupDto {
  @ApiProperty({ example: '1', description: 'Question Types such as matching questions or multiple choice questions' })
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  type: number;

  @ApiProperty({ example: 'Question 1 - 10', description: 'Question group title' })
  @IsNotEmpty()
  @IsString()
  title: string;

  @ApiProperty({ example: 'http://example.com/image1.jpg', description: 'Image Illustration of the question group' })
  @IsString()
  @IsOptional()
  imageUrl: string;

  @ApiProperty({ example: 'Extra information and directions to the question group', description: 'Extra information and directions of a question group' })
  @IsOptional()
  @IsString()
  htmlContent: string;

  @ApiProperty({ example: '[A, B, C, D]', description: 'Matching Options for Matching Questions' })
  @IsOptional()
  @IsString()
  matchingOptions: string;

  @ApiProperty({ example: '[{id: 1, question: "example", answers: [], ...}]', description: 'List of questions for a question group' })
  @IsOptional()
  questions: CreateQuestionDto[];

}
