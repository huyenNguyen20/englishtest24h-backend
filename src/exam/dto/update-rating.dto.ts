import { IsNotEmpty, IsNumber } from 'class-validator';

export class UpdateRatingDto {
  @IsNotEmpty()
  @IsNumber()
  rating: number;
}
