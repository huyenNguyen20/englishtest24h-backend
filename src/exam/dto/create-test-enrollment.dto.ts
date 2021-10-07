import { IsNotEmpty, IsNumber, IsOptional, IsPositive, IsString } from 'class-validator';

export class CreateTestEnrollmentDto {
  @IsOptional()
  @IsNumber()
  @IsPositive()
  score: number;

  @IsNotEmpty()
  @IsString()
  answerObj: string;

  @IsNotEmpty()
  @IsString()
  sectionsObj: string;
}
