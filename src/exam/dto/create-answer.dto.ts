import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsString } from 'class-validator';

export class CreateAnswerDto {
  @ApiProperty({ example: 'ksjf-ksfks-ksjks-skfjk', description: 'Answer ID' })
  @IsNotEmpty()
  @IsString()
  id: string;

  @ApiProperty({ description: 'Answer Content' })
  @IsNotEmpty()
  @IsString()
  content: string;

  @ApiProperty({ example: 'true', description: 'Is Answer Right' })
  @IsNotEmpty()
  @IsBoolean()
  isRight: boolean;
}
