import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber } from 'class-validator';

export class UpdateRatingDto {
  @ApiProperty({ description: 'Rating Number' })
  @IsNotEmpty()
  @IsNumber()
  rating: number;
}
