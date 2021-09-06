import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthRepository } from './auth.repository';
import { JwtStrategy } from './jwt.strategy';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { GoogleStrategy } from './google.strategy';
import { MulterModule } from '@nestjs/platform-express';
import * as config from 'config';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: {
        expiresIn: config.get('jwt.expiresIn'),
      },
    }),
    TypeOrmModule.forFeature([AuthRepository]),
    MulterModule.register({
      dest: 'public/usersFile/images',
      fileFilter: (req, file, cb) => {
        if (!file.originalname.match(/\.(jpg|jpeg|gif|png)$/)) {
          // You can always pass an error if something goes wrong:
          cb(new Error('You can only upload image files'), null);
        }
        // To accept the file pass `true`, like so:
        cb(null, true);
      },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, GoogleStrategy],
  exports: [JwtStrategy, PassportModule],
})
export class AuthModule {}
