import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsPositive } from 'class-validator';

export class FilterDto {
  @ApiProperty({ description: 'Limit' })
  @IsNotEmpty()
  @IsNumber()
  @IsPositive()
  limit: number;

  @ApiProperty({ description: 'Offset' })
  @IsNotEmpty()
  @IsNumber()
  offset: number;
}
