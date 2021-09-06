import { IsNotEmpty, IsNumber, IsPositive, IsString } from 'class-validator';

export class CreateTestEnrollmentDto {
  @IsNotEmpty()
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
