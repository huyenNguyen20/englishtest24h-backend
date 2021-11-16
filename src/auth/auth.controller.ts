import {
  Controller,
  Get,
  Post,
  Body,
  Response,
  ValidationPipe,
  UseGuards,
  HttpStatus,
  UseInterceptors,
  Put,
  Inject,
} from '@nestjs/common';
import { Logger } from "winston";
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtService } from '@nestjs/jwt';
import { AuthGuard } from '@nestjs/passport';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { AuthService } from './auth.service';
import { getUser } from './decorator/getUser.decorator';
import { CreateUserDto } from './dto/createUser.dto';
import { EmailForResetPasswordDto } from './dto/emailForResetPassword.dto';
import { ProfileDto } from './dto/profile.dto';
import { ResetPasswordDto } from './dto/resetPassword.dto';
import { SignInUserDto } from './dto/signinUser.dto';
import { User } from './entities/user.entity';
import { GoogleAuthGuard } from './guards/google-auth.guard';
import { JwtPayload } from './jwtPayload.interface';
import { Express } from 'express';
import { ContactUsFormDto } from './dto/contactUsForm.dto';
import * as config from 'config';
import axios from 'axios';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';

@ApiTags('Authentication and User Endpoints')
@Controller('auth')
export class AuthController {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) 
    private readonly logger: Logger,

    private readonly authService: AuthService,
    private readonly jwtService: JwtService,
  ) {}

  @ApiOperation({ summary: 'Sign Up' })
  @ApiResponse({ status: 200, description: 'true' })
  @Post('signup')
  async signUp(
    @Body(new ValidationPipe()) createUserDto: CreateUserDto,
    @Response() res
    ): Promise<void> {
    try {
      const result: boolean = await this.authService.signUp(createUserDto);
      if(result) return res.status(HttpStatus.OK).json({message: "Signed Up Successfully"});
      throw new Error("Something went wrong with signing up user.");
    } catch (e) {
      this.logger.error(`ERROR in POST /auth/signup --- 
                       ${JSON.stringify(e)}`);
      return res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json({message: "Something went wrong. Please try again!"});
    }

  }

  @ApiOperation({ summary: 'Sign In' })
  @ApiResponse({ status: 200, description: '{token: string}' })
  @Post('signin')
  async signIn(
    @Body(new ValidationPipe()) signInUserDto: SignInUserDto,
    @Response() res
    ):Promise<{token: string}> {
    try {
      const result: {token: string} = await this.authService.signIn(signInUserDto);
      return result;
    } catch (e) {
      this.logger.error(`ERROR in POST /auth/signin --- 
                       ${JSON.stringify(e)}`);
      return res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json({message: "Something went wrong. Please try again!"});
    }
  }

  @ApiOperation({ summary: 'Sign In and Sign Up with Google' })
  @ApiResponse({ status: 200, description: 'Redirecting to Google Auth' })
  @Get('google')
  @UseGuards(GoogleAuthGuard)
  authWithGoogle() {} //eslint-disable-line

  @ApiOperation({ summary: 'Google OAuth Callback' })
  @ApiResponse({
    status: 200,
    description: 'Redirecting to Google Redirect on Client Side',
  })
  @Get('google/callback')
  @UseGuards(GoogleAuthGuard)
  async authWithGoogleCallBack(@getUser() user: User, @Response() res) {
    try {
      const { id, email, isEducator, isAdmin } = user;
      const payload: JwtPayload = { id, email, isEducator, isAdmin };
      const token = await this.jwtService.sign(payload);
      return res
        .status(HttpStatus.OK)
        .redirect(
          `${config.get('client.url')}/oAuthRedirect?token=${encodeURIComponent(
            token,
          )}`,
        );
    } catch (e) {
      this.logger.error(`ERROR in GET /auth/google/callback --- 
                       ${JSON.stringify(e)}`);
      return res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json({message: "Something went wrong. Please try again!"});
    }
  }

  @ApiOperation({ summary: 'Send Email for Resetting Password' })
  @ApiResponse({
    status: 200,
    description: "{message: 'Account associated to the email doesn't exist.}",
  })
  @Post('/lostPassword')
  async sendEmailForResetPassword(
    @Body(new ValidationPipe()) emailForResetPassword: EmailForResetPasswordDto,
    @Response() res,
  ) {
    try {
      const { email } = emailForResetPassword;
      const user : User = await this.authService.getUser(emailForResetPassword);
      if (!user) {
        return res.send({
          message: "Account associated to the email doesn't exist.",
        });
      }

      const body = {
        senderEmail: 'englishtest24@gmail.com',
        recipientEmail: email,
        subject: 'Reset Password for englishtest24 Account',
        htmlMessage: `
              <p style="font-size: 16px">Thank you for sending the message! </p>
              <p style="font-size: 16px">Please click the following link for password reset: </p>
              <p style="font-size: 16px">${config.get(
                'client.url',
              )}/resetPassword</p>
              <p style="font-size: 16px">From, </p>
              <p style="font-size: 16px">englishtest24 </p>
              `,
      };

      const resp = await axios.post(config.get('sendEmail').url, body);
      if (resp.status === 200)
        return res.send({
          message:
            'Reset password link was sent to your email. Please check your email!',
        });
      else throw new Error('Something went wrong. Please try again!');
    } catch (e) {
      this.logger.error(`ERROR in POST /auth/lostPassword --- 
                       ${JSON.stringify(e)}`);
      return res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json({message: "Something went wrong. Please try again!"});
    }
  }

  @ApiOperation({ summary: 'Reset Password' })
  @ApiResponse({ status: 200, description: '{message: true}' })
  @Post('/lostPassword/reset')
  async resetPassword(
    @Body(new ValidationPipe()) resetPassword: ResetPasswordDto,
    @Response() res,
  ) {
    try{
      const result : boolean = await this.authService.resetPassword(resetPassword);
      if(result) return res.status(HttpStatus.OK).json({ message: true });
      throw new Error();
    } catch (e) {
      this.logger.error(`ERROR in POST /auth/lostPassword/reset --- 
                       ${JSON.stringify(e)}`);
      return res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json({message: "Something went wrong. Please try again!"});
    }
  }

  @ApiOperation({ summary: 'Get User Profile' })
  @ApiResponse({
    status: 200,
    description: '{avatarUrl,email,firstName,lastName}',
  })
  @Get('/profile')
  @UseGuards(AuthGuard())
  async getProfile(
    @getUser() user: User, 
    @Response() res) 
    {
    try {
      return res.status(HttpStatus.OK).json({
        avatarUrl: user.avatarUrl,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
      });
    } catch (e) {
      this.logger.error(`ERROR in GET /auth/profile --- 
                       ${JSON.stringify(e)}`);
      return res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json({message: "Something went wrong. Please try again!"});
    }
  }

  @ApiOperation({ summary: 'Get User Ids to populate routes in Frontend' })
  @ApiResponse({
    status: 200,
    description: 'Array of string',
  })
  @Get('/users')
  async getUserIndexes(@Response() res) {
    try {
      const users : User[] = await this.authService.getUserIndexes();
      return res.status(200).json(users);
    } catch (e) {
      this.logger.error(`ERROR in GET /auth/users --- 
                       ${JSON.stringify(e)}`);
      return res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json({message: "Something went wrong. Please try again!"});
    }
  }

  @ApiOperation({ summary: 'Update User Profile' })
  @ApiResponse({
    status: 200,
    description: '{avatarUrl,email,firstName,lastName}',
  })
  @Post('/profile')
  @UseGuards(AuthGuard())
  @UseInterceptors(FileFieldsInterceptor([]))
  async editProfile(
    @getUser() user: User,
    @Body(new ValidationPipe()) updateProfile: ProfileDto,
    @Response() res,
  ) {
    try {
      const updatedUser : ProfileDto = await this.authService.updateProfile(
        user,
        updateProfile,
      );
      return res.status(200).json(updatedUser);
    } catch (e) {
      this.logger.error(`ERROR in POST /auth/profile --- 
                       ${JSON.stringify(e)}`);
      return res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json({message: "Something went wrong. Please try again!"});
    }
  }

  @ApiOperation({ summary: 'Toggle isEducator' })
  @ApiResponse({
    status: 200,
    description: 'Return updated user profile',
  })
  @Put('/toggleIsEducator')
  @UseGuards(AuthGuard())
  async toggleIsEducator(@getUser() user: User, @Response() res) {
    try{
      const updatedUser = await this.authService.toggleIsEducator(user);
      return res.status(200).json(updatedUser);
    } catch (e) {
      this.logger.error(`ERROR in PUT /auth/toggleIsEducator --- 
                       ${JSON.stringify(e)}`);
      return res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json({message: "Something went wrong. Please try again!"});
    }
  }

  @ApiOperation({ summary: 'Forward User Message To Admin Email' })
  @ApiResponse({
    status: 200,
    description: "{message: 'Your message has been sent successfully!'}",
  })
  @Post('/contactus')
  async sendContactUsForm(
    @Body(new ValidationPipe()) contactUsForm: ContactUsFormDto,
    @Response() res,
  ) {
    const { email, name, message } = contactUsForm;
    const body = {
      senderEmail: 'englishtest24@gmail.com',
      recipientEmail: 'nguyendieuhuyen2809@gmail.com',
      subject: 'Message From User',
      htmlMessage: `
            <p style="font-size: 16px">User Message </p>
            <p style="font-size: 16px">User Name: ${name} </p>
            <p style="font-size: 16px">User Email: ${email} </p>
            <p style="font-size: 16px">User Message: ${message}</p>
            <p style="font-size: 16px">From, </p>
            <p style="font-size: 16px">englishtest24 </p>
            `,
    };
    try {
      const resp = await axios.post(config.get('sendEmail').url, body);
      if (resp.status === 200)
        return res.send({
          message: 'Your message has been sent successfully!',
        });
      else throw new Error('Something went wrong. Please try again!');
    } catch (e) {
      this.logger.error(`ERROR in POST /auth/contactus --- 
                       ${JSON.stringify(e)}`);
      return res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json({message: "Something went wrong. Please try again!"});
    }
  }
}
