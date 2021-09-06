import { IsString, Matches, MaxLength, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ResetPasswordDto {
  @ApiProperty({ example: 'abc@example.com', description: 'Email' })
  @IsString()
  @Matches(/.+@.+\..+/, { message: 'Invalid Email. Please use another email!' })
  email: string;

  @ApiProperty({ example: 'abcABC123#', description: 'Password' })
  @IsString()
  @MinLength(8)
  @MaxLength(20)
  @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
    message: 'password too weak',
  })
  password: string;
}
