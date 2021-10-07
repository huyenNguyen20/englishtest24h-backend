import {
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({ example: 'abc@example.com', description: 'Email' })
  @IsString()
  @IsNotEmpty()
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

  @ApiProperty({ example: 'abcABC123#', description: 'Password' })
  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  @MaxLength(20)
  @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
    message: 'password too weak',
  })
  password: string;

  @ApiProperty({ example: 'true', description: 'The user is an educator' })
  @IsBoolean()
  @IsNotEmpty()
  @IsOptional()
  isEducator: boolean;
}
