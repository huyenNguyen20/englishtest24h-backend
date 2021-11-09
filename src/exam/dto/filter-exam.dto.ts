import { IsNotEmpty, IsNumber, IsOptional, IsPositive, IsString } from 'class-validator';

export class FilterExamDto {
  @IsOptional()
  @IsString()
  search: string;

  @IsOptional()
  @IsNumber()
  subject: number;

  @IsOptional()
  @IsNumber()
  authorId: number;

  @IsNotEmpty()
  @IsNumber()
  @IsPositive()
  limit: number;

  @IsNotEmpty()
  @IsNumber()
  offset: number;
}
