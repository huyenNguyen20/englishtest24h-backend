import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateTeacherAnswerDto {
  @ApiProperty({ description: 'Teacher Answer' })
  @IsNotEmpty()
  @IsString()
  answer: string;
}
