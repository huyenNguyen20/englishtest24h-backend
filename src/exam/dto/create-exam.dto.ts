import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class CreateExamDto {
  @ApiProperty({ example: 'http://example.com/myImage', description: 'Exam Image URL' })
  @IsOptional()
  @IsString()
  imageUrl: string;

  @ApiProperty({ example: 'Reading Test 1', description: 'Exam Title' })
  @IsNotEmpty()
  @IsString()
  title: string;

  @ApiProperty({ example: 'This is reading test 1', description: 'Exam Description' })
  @IsNotEmpty()
  @IsString()
  description: string;

  @ApiProperty({ example: '1', description: 'Subject ID' })
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  subject: number;

  @ApiProperty({ example: '60', description: 'Time Allowed for an Exam' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  timeAllowed: number;
}
