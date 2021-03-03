import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PostgresErrorCode } from '../database/postgresErrorCodes.enum';
import { RegisterUserDto } from '../users/dto/register-user.dto';
import { User } from '../users/models/user.model';
import { UsersService } from '../users/users.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async register(registrationData: RegisterUserDto): Promise<User> {
    const hashedPassword = await this.hashPassword(registrationData);
    try {
      const createdUser = await this.createUser(
        registrationData,
        hashedPassword,
      );
      this.deletePasswordFromUserObject(createdUser);
      return createdUser;
    } catch (error) {
      this.handleError(error?.code);
    }
  }

  private async hashPassword(
    registrationData: RegisterUserDto,
  ): Promise<string> {
    return await bcrypt.hash(registrationData.password, 10);
  }

  private async createUser(
    registrationData: RegisterUserDto,
    hashedPassword: string,
  ): Promise<User> {
    return await this.usersService.createUser({
      ...registrationData,
      password: hashedPassword,
    });
  }

  public async getAuthenticatedUser(
    email: string,
    password: string,
  ): Promise<User> {
    try {
      const user = await this.usersService.getByEmail(email);
      await this.verifyPassword(password, user.password);
      this.deletePasswordFromUserObject(user);
      return user;
    } catch (error) {
      throw new BadRequestException('Wrong credentials provided');
    }
  }

  private async verifyPassword(
    password: string,
    hashedPassword: string,
  ): Promise<void> {
    const isPasswordMatching = await bcrypt.compare(password, hashedPassword);
    if (!isPasswordMatching) {
      throw new BadRequestException('Wrong credentials provided');
    }
  }

  private handleError(errorCode: string): void {
    if (errorCode === PostgresErrorCode.UniqueViolation) {
      throw new BadRequestException('User with that email already exists');
    }
    throw new InternalServerErrorException('Something went wrong');
  }

  public deletePasswordFromUserObject(createdUser: User): void {
    delete createdUser.password;
  }

  public getCookieWithJwtToken(userId: number): string {
    const payload: TokenPayload = { userId };
    const token = this.jwtService.sign(payload);
    return `Authentication=${token}; HttpOnly; Path=/; Max-Age=${this.configService.get(
      'JWT_EXPIRATION_TIME',
    )}`;
  }
}
