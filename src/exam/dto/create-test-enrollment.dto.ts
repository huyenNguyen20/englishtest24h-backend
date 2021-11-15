import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
} from 'class-validator';

export class CreateTestEnrollmentDto {
  @ApiProperty({ example: '10', description: 'Exam Score' })
  @IsOptional()
  @IsNumber()
  @IsPositive()
  score: number;

  @ApiProperty({ example: '15', description: 'Exam Total Score' })
  @IsNumber()
  @IsPositive()
  totalScore: number;

  @ApiProperty({ description: 'Answer Object (JSON String)' })
  @IsNotEmpty()
  @IsString()
  answerObj: string;

  @ApiProperty({ description: 'Sections Object (JSON String)' })
  @IsNotEmpty()
  @IsString()
  sectionsObj: string;
}
