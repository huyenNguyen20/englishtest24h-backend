import { IsString, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class EmailForResetPasswordDto {
  @ApiProperty({ example: 'abc@example.com', description: 'Email' })
  @IsString()
  @Matches(/.+@.+\..+/, { message: 'Invalid Email. Please use another email!' })
  email: string;
}
