import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateSectionDto {
  @ApiProperty({ example: 'Section 1', description: 'Section Title' })
  @IsNotEmpty()
  @IsString()
  title: string;

  @ApiProperty({ example: 'Reading Text goes here', description: 'Reading Text for a reading section' })
  @IsOptional()
  @IsString()
  htmlContent: string;

  @ApiProperty({ example: 'Directions: You should spend 20 minutes on this section', description: 'Directions for a section' })
  @IsString()
  @IsOptional()
  directions: string;

  @ApiProperty({ example: 'Listening Transcript', description: 'Transcription for a listening section' })
  @IsOptional()
  @IsString()
  transcription: string;

  @ApiProperty({ example: 'http://example.com/audio1.ogg', description: 'audio url for a listening section' })
  @IsOptional()
  @IsString()
  audioUrl: string;

  @ApiProperty({ example: 'http://example.com/image1.jpeg', description: 'image url for a section' })
  @IsOptional()
  @IsString()
  imageUrl: string;
}
