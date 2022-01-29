import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
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
    const user = await this.getUser({ email });
    const payload: JwtPayload = {
      id: user.id,
      email,
      isEducator: user.isEducator,
      isAdmin: user.isAdmin,
    };
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

  async getUserIndexes(): Promise<User[]> {
    return await this.authRepository.find({
      select: ['id'],
    });
  }

  async resetPassword(resetPassword: ResetPasswordDto): Promise<boolean> {
    return await this.authRepository.resetPassword(resetPassword);
  }

  async updateProfile(user: User, updates: ProfileDto): Promise<ProfileDto> {
    // If there is a new avatarUrl, delete the old one
    const { avatarUrl } = updates;
    if (
      avatarUrl &&
      Boolean(user.avatarUrl) &&
      user.avatarUrl !== avatarUrl &&
      !user.avatarUrl.includes('/')
    ) {
      const filename = user.avatarUrl;
      if (filename) {
        const { deleteImage } = require('../shared/helpers');
        await deleteImage(filename);
      }
    }
    return await this.authRepository.updateProfile(user, updates);
  }

  async toggleIsEducator(user: User) {
    const profile = await this.authRepository.findOne(user.id);
    return await this.authRepository.updateProfile(user, {
      isEducator: !profile.isEducator,
    });
  }

  async sendEmail(emailObject: {
    senderEmail: string;
    recipientEmail: string;
    subject: string;
    htmlMessage: string;
  }): Promise<void> {
    try {
      // Require neccessary library
      const AWS = require('aws-sdk');

      // Configure AWS Client
      const sesv2 = new AWS.SESV2({
        region: process.env.AWS_REGION_S3,
        accessKeyId: process.env.AWS_ACCESS_KEY_ID_S3,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY_S3,
      });

      const { senderEmail, recipientEmail, subject, htmlMessage } = emailObject;
      if (!senderEmail || !recipientEmail || !subject || !htmlMessage)
        throw new BadRequestException();
      const params = {
        Content: {
          /* required */
          Simple: {
            Body: {
              /* required */
              Html: {
                Data: htmlMessage /* required */,
              },
            },
            Subject: {
              /* required */ Data: subject /* required */,
            },
          },
        },
        Destination: {
          ToAddresses: [recipientEmail],
        },
        FromEmailAddress: senderEmail,
      };
      await sesv2.sendEmail(params).promise();
    } catch (err) {
      throw new InternalServerErrorException(err);
    }
  }
  /*****Admin Methods***** */
  async getEducators(): Promise<User[]> {
    return await this.authRepository.find({
      select: ['id', 'email', 'firstName', 'lastName'],
      where: { isEducator: true },
    });
  }

  async getStudents(): Promise<User[]> {
    return await this.authRepository.find({
      select: ['id', 'email', 'firstName', 'lastName'],
      where: { isEducator: false },
    });
  }

  async deleteEducator(educatorId: number): Promise<User[]> {
    await this.authRepository.deleteUser(educatorId);
    return await this.getEducators();
  }

  async deleteStudent(studentId: number): Promise<User[]> {
    await this.authRepository.deleteUser(studentId);
    return await this.getStudents();
  }
}
