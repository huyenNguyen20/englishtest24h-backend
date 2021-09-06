import { IsNumber, IsOptional, IsPositive, IsString } from 'class-validator';

export class FilterExamDto {
  @IsOptional()
  @IsString()
  search: string;

  @IsOptional()
  @IsNumber()
  subject: number;

  @IsOptional()
  @IsNumber()
  @IsPositive()
  limit: number;

  @IsOptional()
  @IsNumber()
  @IsPositive()
  offset: number;
}
