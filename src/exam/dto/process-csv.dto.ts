import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class ProcessCSVDto {
  @ApiProperty({
    name: 'fileUrl',
    description:
      'Link to download the questionGroup CSV file, eg. http://www.example.com/example.xlsx',
  })
  @IsNotEmpty()
  @IsString()
  fileUrl: string;
}
