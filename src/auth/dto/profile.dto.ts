import { IsNotEmpty, IsOptional, IsString, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ProfileDto {
  @ApiProperty({ example: 'abc@example.com', description: 'Email' })
  @IsString()
  @Matches(/.+@.+\..+/, { message: 'Invalid Email. Please try again!' })
  email: string;

  @ApiProperty({ example: 'Huyen', description: 'First Name' })
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @ApiProperty({ example: 'Nguyen', description: 'Last Name' })
  @IsString()
  @IsNotEmpty()
  lastName: string;

  @ApiProperty({ example: '', description: 'Email' })
  @IsOptional()
  avatarUrl: string;
}
