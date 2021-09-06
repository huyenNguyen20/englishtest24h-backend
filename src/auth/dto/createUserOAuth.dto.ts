import { IsNotEmpty, IsString } from 'class-validator';

export class CreateUserOAuthDto {
  @IsString()
  email: string;

  @IsString()
  @IsNotEmpty()
  firstName: string;

  @IsString()
  @IsNotEmpty()
  lastName: string;

  @IsString()
  @IsNotEmpty()
  OAuthId: string;

  @IsString()
  @IsNotEmpty()
  avartarUrl: string;
}
