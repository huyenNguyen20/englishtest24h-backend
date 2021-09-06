import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class CreateExamDto {
  @IsOptional()
  @IsString()
  imageUrl: string;

  @IsNotEmpty()
  @IsString()
  title: string;

  @IsNotEmpty()
  @IsString()
  description: string;

  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  subject: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  timeAllowed: number;
}
