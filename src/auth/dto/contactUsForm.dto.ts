import { IsNotEmpty, IsString, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ContactUsFormDto {
  @ApiProperty({ example: 'abc@example.com', description: 'Email' })
  @IsString()
  @Matches(/.+@.+\..+/, { message: 'Invalid Email. Please try again!' })
  email: string;

  @ApiProperty({ example: 'Huyen Nguyen', description: 'Name' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'Hi, this is a message', description: 'Message' })
  @IsString()
  @IsNotEmpty()
  message: string;
}
