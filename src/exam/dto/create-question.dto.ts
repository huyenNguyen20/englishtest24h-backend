import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { CreateAnswerDto } from './create-answer.dto';

export class CreateQuestionDto {
  @ApiProperty({ example: 'http://example.com/image1.jpeg', description: 'Image URL for the question' })
  @IsOptional()
  @IsString()
  imageUrl: string;

  @ApiProperty({ example: '5', description: 'Score / Question' })
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  score: number;

  @ApiProperty({ example: '1', description: 'Question Order' })
  @IsOptional()
  @IsNumber()
  @Min(1)
  order: number;

  @ApiProperty({ example: '200', description: 'Minimum Words Required for a Writing question' })
  @IsOptional()
  @IsNumber()
  @Min(1)
  minWords: number;

  @ApiProperty({ example: 'What is the main idea?', description: 'Question' })
  @IsOptional()
  @IsString()
  question: string;

  @ApiProperty({ example: 'Explaination', description: 'Explaination' })
  @IsOptional()
  @IsString()
  htmlExplaination: string;

  @IsOptional()
  answers: CreateAnswerDto[];
}
