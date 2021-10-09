import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsPositive, IsString } from 'class-validator';

export class CreateWritingSectionDto {
  @ApiProperty({ example: 'Section 1', description: 'Section Title' })
  @IsNotEmpty()
  @IsString()
  title: string;

  @ApiProperty({ example: 'Directions: You should spend 20 minutes on this section', description: 'Directions for a section' })
  @IsNotEmpty()
  @IsString()
  directions: string;

  @ApiProperty({ example: 'http://example.com/image1.jpeg', description: 'image url for a section' })
  @IsOptional()
  @IsString()
  imageUrl: string;

  @ApiProperty({ example: 'Question 1', description: 'Question for writing question' })
  @IsNotEmpty()
  @IsString()
  question: string;

  @ApiProperty({ example: '200', description: 'Minimum words required for the writing question' })
  @IsNotEmpty()
  @IsNumber()
  @IsPositive()
  minWords: number;

  @ApiProperty({ example: '9', description: 'Score for the question' })
  @IsNotEmpty()
  @IsNumber()
  @IsPositive()
  score: number;


  @ApiProperty({ example: 'This is explaination', description: 'Sample Answer for writing question' })
  @IsNotEmpty()
  @IsString()
  htmlExplaination: string;
}
