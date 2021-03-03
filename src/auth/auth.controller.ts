import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBody,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Response } from 'express';
import { UserSignInDto } from '../users/dto/user-sign-in.dto';
import { UserSignedInResponse } from '../users/models/user-signed-in.response';
import { RegisterUserDto } from '../users/dto/register-user.dto';
import { UserRegisteredResponse } from '../users/models/user-registered.response';
import { AuthService } from './auth.service';
import { LocalAuthenticationGuard } from './guards/localAuth.guard';
import RequestWithUser from './requestWithUser.interface';

@ApiTags('users')
@Controller()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiCreatedResponse({
    description: 'The user has been successfully registered.',
    type: UserRegisteredResponse,
  })
  @Post('signup')
  async registerUser(
    @Body() registerUserDto: RegisterUserDto,
  ): Promise<UserRegisteredResponse> {
    const user = await this.authService.register(registerUserDto);
    return new UserRegisteredResponse(user);
  }

  @ApiOkResponse({
    description: 'The user has been signed in successfully.',
    type: UserSignedInResponse,
    headers: {
      Authentication: {
        description:
          'Cookie with the signed JWT Token, needed for protected endpoints',
      },
    },
  })
  @ApiBody({
    type: UserSignInDto,
  })
  @HttpCode(HttpStatus.OK)
  @UseGuards(LocalAuthenticationGuard)
  @Post('signin')
  async login(
    @Req() request: RequestWithUser,
    @Res() response: Response,
  ): Promise<Response> {
    const { user } = request;
    const cookie = this.authService.getCookieWithJwtToken(user.id);
    response.setHeader('Set-Cookie', cookie);
    return response.send(new UserSignedInResponse(user));
  }
}
