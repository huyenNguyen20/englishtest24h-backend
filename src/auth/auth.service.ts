import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { join } from 'path';
import { AuthRepository } from './auth.repository';
import { CreateUserDto } from './dto/createUser.dto';
import { CreateUserOAuthDto } from './dto/createUserOAuth.dto';
import { EmailForResetPasswordDto } from './dto/emailForResetPassword.dto';
import { ProfileDto } from './dto/profile.dto';
import { ResetPasswordDto } from './dto/resetPassword.dto';
import { SignInUserDto } from './dto/signinUser.dto';
import { User } from './entities/user.entity';
import { JwtPayload } from './jwtPayload.interface';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(AuthRepository)
    private authRepository: AuthRepository,
    private jwtService: JwtService,
  ) {}

  async signUp(createAuthDto: CreateUserDto): Promise<boolean> {
    return await this.authRepository.createUser(createAuthDto);
  }

  async signIn(signInUserDto: SignInUserDto): Promise<{ token: string }> {
    const { email } = signInUserDto;
    const isSignedIn = await this.authRepository.signInUser(signInUserDto);
    if (!isSignedIn) throw new UnauthorizedException();
    const user = await this.getUser({email});
    const payload: JwtPayload = { email, isEducator: user.isEducator, isAdmin: user.isAdmin };
    const token = await this.jwtService.sign(payload);
    return { token };
  }

  async signUpOrSignInWithOAuth(
    createUserWithOAuth: CreateUserOAuthDto,
  ): Promise<User> {
    const { OAuthId } = createUserWithOAuth;
    const user = await this.authRepository.findOne({ OAuthId });
    if (!user)
      return await this.authRepository.createUserWithOAuth(createUserWithOAuth);
    else return user;
  }

  async getUser(
    emailForResetPassword: EmailForResetPasswordDto,
  ): Promise<User | null> {
    const { email } = emailForResetPassword;
    return await this.authRepository.findOne({ email });
  }

  async resetPassword(resetPassword: ResetPasswordDto): Promise<boolean> {
    return await this.authRepository.resetPassword(resetPassword);
  }

  async updateProfile(user: User, updates: ProfileDto): Promise<ProfileDto> {
    const profile = await this.authRepository.findOne(user.id);
    if (profile && Boolean(profile.avatarUrl)) {
      const fs = require('fs');
      const fileName = profile.avatarUrl.split('/');
      try {
        fs.unlinkSync(
          join(
            process.cwd(),
            `public/usersFile/images/${fileName[fileName.length - 1]}`,
          ),
        );
        console.log('File was deleted');
      } catch (e) {
        console.log('File Deletion Error: Something went wrong');
      }
    }
    return await this.authRepository.updateProfile(user, updates);
  }
}
