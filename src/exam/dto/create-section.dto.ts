import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateSectionDto {
  @IsNotEmpty()
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  htmlContent: string;

  @IsOptional()
  @IsString()
  transcription: string;

  @IsOptional()
  @IsString()
  audioUrl: string;

  @IsOptional()
  @IsString()
  imageUrl: string;
}
