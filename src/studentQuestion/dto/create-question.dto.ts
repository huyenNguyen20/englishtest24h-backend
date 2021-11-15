import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateQuestionDto {
  @ApiProperty({ description: 'Student Question Title' })
  @IsNotEmpty()
  @IsString()
  title: string;

  @ApiProperty({ description: 'Student Question Content' })
  @IsNotEmpty()
  @IsString()
  question: string;
}
