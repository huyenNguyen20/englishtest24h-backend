import { Strategy } from 'passport-google-oauth20';
import { PassportStrategy } from '@nestjs/passport';
import { BadRequestException, Injectable } from '@nestjs/common';
import { AuthService } from './auth.service';

require('dotenv').config();
@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({
      clientID: process.env.GOOGLE_CLIENTID,
      clientSecret: process.env.GOOGLE_CLIENTSECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
      scope: ['email', 'profile'],
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
    done,
  ): Promise<void> {
    try {
      const resp = await this.authService.signUpOrSignInWithOAuth({
        OAuthId: profile.id,
        email: profile.emails[0].value,
        firstName: profile.name.givenName,
        lastName: profile.name.familyName,
        avartarUrl:
          profile.photos && profile.photos.length > 0
            ? profile.photos[0].value.replace('sz=50', 'sz=128')
            : '',
      });
      if (resp) {
        done(null, resp);
      } else
        throw new BadRequestException(
          'Something went wrong. Please try again!',
        );
    } catch (err) {
      done(err, null);
    }
  }
}
