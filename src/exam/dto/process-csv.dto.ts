import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class ProcessCSVDto {
  @ApiProperty({
    name: 'key',
    description:
      'Key to questionGroup CSV file, eg. sfkaj-ekksk-wekrk-kksss',
  })
  @IsNotEmpty()
  @IsString()
  key: string;
}
