import { IsNotEmpty, IsNumber, IsPositive } from 'class-validator';

export class FilterDto {
  @IsNotEmpty()
  @IsNumber()
  @IsPositive()
  limit: number;

  @IsNotEmpty()
  @IsNumber()
  offset: number;
}