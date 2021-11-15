import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateUserOAuthDto {
  @ApiProperty({ example: 'abc@example.com', description: 'Email' })
  @IsString()
  email: string;

  @ApiProperty({ example: 'Anna', description: 'First Name' })
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @ApiProperty({ example: 'Kim', description: 'Last Name' })
  @IsString()
  @IsNotEmpty()
  lastName: string;

  @ApiProperty({ example: 'aury8u18iuajgajgjabgaf', description: 'OAuthID' })
  @IsString()
  @IsNotEmpty()
  OAuthId: string;

  @ApiProperty({ example: 'http://example.com/myImage', description: 'User Photo URL' })
  @IsString()
  @IsNotEmpty()
  avartarUrl: string;
}
