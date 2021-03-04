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
  ApiBadRequestResponse,
  ApiBody,
  ApiCreatedResponse,
  ApiHeader,
  ApiInternalServerErrorResponse,
  ApiOkResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { Response } from 'express';
import { UserSignInDto } from '../users/dto/user-sign-in.dto';
import { UserSignedInResponse } from '../users/models/user-signed-in.response';
import { RegisterUserDto } from '../users/dto/register-user.dto';
import { UserRegisteredResponse } from '../users/models/user-registered.response';
import { AuthService } from './auth.service';
import { LocalAuthenticationGuard } from './guards/local-auth.guard';
import RequestWithUser from './requestWithUser.interface';
import { JwtAuthenticationGuard } from './guards/jwt-auth.guard';

@ApiTags('auth')
@Controller()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiCreatedResponse({
    description: 'The user has been successfully registered.',
    type: UserRegisteredResponse,
  })
  @ApiBadRequestResponse({
    description:
      'User with that email already exists | Password should contain at least one upper case, one lower case, one digit and one symbol',
  })
  @ApiInternalServerErrorResponse({
    description: 'Internal server error',
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
  @ApiUnauthorizedResponse({
    description: 'Wrong credentials provided',
  })
  @ApiInternalServerErrorResponse({
    description: 'Internal server error',
  })
  @ApiBody({
    type: UserSignInDto,
  })
  @HttpCode(HttpStatus.OK)
  @UseGuards(LocalAuthenticationGuard)
  @Post('signin')
  async signin(
    @Req() request: RequestWithUser,
    @Res() response: Response,
  ): Promise<Response> {
    const { user } = request;
    const cookie = this.authService.getCookieWithJwtToken(user.id);
    response.setHeader('Set-Cookie', cookie);
    return response.send(new UserSignedInResponse(user));
  }

  @ApiOkResponse({
    description: 'The user has been signed out successfully.',
  })
  @ApiUnauthorizedResponse({
    description:
      'Unauthorized. This happens when you hit the endpoint without being signed in',
  })
  @ApiHeader({
    name: 'Authentication',
    description:
      'Authentication cookie with the JWT Token obtained when you signed in',
    required: true,
  })
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthenticationGuard)
  @Post('signout')
  async signout(
    @Req() request: RequestWithUser,
    @Res() response: Response,
  ): Promise<Response> {
    response.setHeader('Set-Cookie', this.authService.getCookieForLogOut());
    return response.sendStatus(200);
  }
}
