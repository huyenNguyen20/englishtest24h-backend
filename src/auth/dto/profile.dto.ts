import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ProfileDto {
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
