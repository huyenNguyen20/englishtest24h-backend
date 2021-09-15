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
  UploadedFile,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtService } from '@nestjs/jwt';
import { AuthGuard } from '@nestjs/passport';
import { FileFieldsInterceptor, FileInterceptor } from '@nestjs/platform-express';
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

@ApiTags('Authentication and User Endpoints')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly jwtService: JwtService,
  ) {}

  @ApiOperation({ summary: 'Sign Up' })
  @ApiResponse({ status: 200, description: 'true' })
  @Post('signup')
  async signUp(@Body(new ValidationPipe()) createUserDto: CreateUserDto) {
    return await this.authService.signUp(createUserDto);
  }

  @ApiOperation({ summary: 'Sign In' })
  @ApiResponse({ status: 200, description: '{token: string}' })
  @Post('signin')
  async signIn(@Body(new ValidationPipe()) signInUserDto: SignInUserDto) {
    return await this.authService.signIn(signInUserDto);
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
    const { email } = user;
    const payload: JwtPayload = { email };
    const token = await this.jwtService.sign(payload);
    res.cookie('nest-cookie', token, {
      expires: new Date(Date.now() + 60 * 60 * 1000),
    });
    return res.status(HttpStatus.OK).redirect(`${config.get('client.url')}/oAuthRedirect`);
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
    const { email } = emailForResetPassword;
    const user = await this.authService.getUser(emailForResetPassword);
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

    try {
      const resp = await axios.post(config.get('sendEmail').url, body);
      if (resp.status === 200)
        return res.send({
          message:
            'Reset password link was sent to your email. Please check your email!',
        });
      else throw new Error('Something went wrong. Please try again!');
    } catch (err) {
      return res.send({ message: err.message || err.toString() });
    }
  }

  @ApiOperation({ summary: 'Reset Password' })
  @ApiResponse({ status: 200, description: '{message: true}' })
  @Post('/lostPassword/reset')
  async resetPassword(
    @Body(new ValidationPipe()) resetPassword: ResetPasswordDto,
    @Response() res,
  ) {
    await this.authService.resetPassword(resetPassword);
    return res.status(HttpStatus.OK).json({ message: true });
  }

  @ApiOperation({ summary: 'Get User Profile' })
  @ApiResponse({
    status: 200,
    description: '{avatarUrl,email,firstName,lastName}',
  })
  @Get('/profile')
  @UseGuards(AuthGuard())
  async getProfile(@getUser() user: User, @Response() res) {

    return res.status(HttpStatus.OK).json({
      avatarUrl: user.avatarUrl,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
    });
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
    const updatedUser = await this.authService.updateProfile(user, updateProfile);
    return res.status(200).json(updatedUser);
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
    } catch (err) {
      return res.send({ message: err.message || err.toString() });
    }
  }
}
