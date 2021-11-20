import { EntityRepository, getConnection, Repository } from 'typeorm';
import { CreateUserDto } from './dto/createUser.dto';
import { User } from './entities/user.entity';
import * as bcrypt from 'bcryptjs';
import { BadRequestException } from '@nestjs/common';
import { SignInUserDto } from './dto/signinUser.dto';
import { CreateUserOAuthDto } from './dto/createUserOAuth.dto';
import { ResetPasswordDto } from './dto/resetPassword.dto';

@EntityRepository(User)
export class AuthRepository extends Repository<User> {
  async createUser(createUserDto: CreateUserDto): Promise<boolean> {
    const { email, firstName, lastName, password } = createUserDto;
    const user = new User();
    user.salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, user.salt);
    user.email = email;
    user.firstName = firstName;
    user.lastName = lastName;
    user.OAuthId = 'none';
    user.avatarUrl = '';
    try {
      await user.save();
      return true;
    } catch (e) {
      throw new BadRequestException(e.toString());
    }
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto): Promise<boolean> {
    const { email, password } = resetPasswordDto;
    try {
      const user = await this.findOne({ email });
      if (!user)
        throw new Error("Account associated with this email doesn't exist");
      user.salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, user.salt);

      await user.save();
      return true;
    } catch (e) {
      throw new BadRequestException(e.message || e.toString());
    }
  }

  async createUserWithOAuth(
    createUserWithOAuth: CreateUserOAuthDto,
  ): Promise<User> {
    const { email, firstName, lastName, OAuthId, avartarUrl } =
      createUserWithOAuth;
    const user = new User();
    user.salt = await bcrypt.genSalt(10);

    user.password = await bcrypt.hash(
      process.env.OAUTH_USER_PASSWORD,
      user.salt,
    );
    user.email = email;
    user.firstName = firstName;
    user.lastName = lastName;
    user.OAuthId = OAuthId;
    user.avatarUrl = avartarUrl;
    try {
      await user.save();
      return user;
    } catch (e) {
      throw new BadRequestException(`Error in Repo: ${e.toString()}`);
    }
  }

  async signInUser(signInUserDto: SignInUserDto): Promise<boolean> {
    const { email, password } = signInUserDto;
    const user = await this.findOne({ email });
    if (!user) return false;
    return await user.validatePassword(password);
  }

  async updateProfile(user: User, updates): Promise<any> {
    try {
      const updatedUser = await this.createQueryBuilder()
        .update(User)
        .set({
          ...updates,
        })
        .where('id = :id', { id: user.id })
        .execute();

      return await this.createQueryBuilder('user')
        .select('user.firstName')
        .addSelect('user.lastName')
        .addSelect('user.avatarUrl')
        .addSelect('user.email')
        .where('id = :id', { id: user.id })
        .getOne();
    } catch (e) {
      throw new BadRequestException(e.toString());
    }
  }

  async deleteUser(id: number) {
    await getConnection()
      .createQueryBuilder()
      .delete()
      .from(User)
      .where('id = :id', { id })
      .execute();
  }
}
