import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
} from 'class-validator';

export class FilterExamDto {
  @ApiProperty({ example: 'ielts', description: 'Search Term' })
  @IsOptional()
  @IsString()
  search: string;

  @ApiProperty({ example: '1', description: 'Subject ID' })
  @IsOptional()
  @IsNumber()
  subject: number;

  @ApiProperty({ example: '1', description: 'Author ID' })
  @IsOptional()
  @IsNumber()
  authorId: number;

  @ApiProperty({ example: '4', description: 'The number of exams be returned' })
  @IsNotEmpty()
  @IsNumber()
  @IsPositive()
  limit: number;

  @ApiProperty({ example: '5', description: 'Offset' })
  @IsNotEmpty()
  @IsNumber()
  offset: number;
}
